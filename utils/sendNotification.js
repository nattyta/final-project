const Notification = require("../model/notificationModel");
const { sendEmail } = require("./emailService");

const sendNotification = async ({ userId, title, message, type = "reminder", email, actionUrl }) => {
  try {
    console.log("📣 Creating notification...");
    const savedNotification = await Notification.create({
      userId,
      title,
      message,
      type,
      isRead: false,
      actionUrl: actionUrl || null,
    });
    console.log("✅ Notification saved:", savedNotification._id);

    if (email) {
      console.log("📧 Sending email to:", email);

      // 💅 Styled HTML Template
      const html = `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #4A90E2;">📚 ${title}</h2>
          <p style="font-size: 16px; color: #333;">${message}</p>
          ${actionUrl ? `
            <a href="${actionUrl}" style="
              display: inline-block;
              margin-top: 20px;
              padding: 10px 20px;
              background-color: #4A90E2;
              color: #fff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
            ">Take Action</a>
          ` : ""}
          <p style="margin-top: 30px; font-size: 12px; color: #aaa;">Sent by Library Notification System</p>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: title,
        text: `${message}${actionUrl ? `\n\n🔗 Action: ${actionUrl}` : ''}`,
        html
      });

      console.log("📨 Email sent successfully to:", email);
    } else {
      console.warn("⚠️ No email provided — skipping email sending.");
    }

  } catch (err) {
    console.error("❌ Notification error:", err.message || err);
  }
};

module.exports = { sendNotification };
