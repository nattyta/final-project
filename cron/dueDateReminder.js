const mongoose = require("mongoose");
const { loanModel } = require("../model/loanModel");
const { userModel } = require("../model/userModel");
const { sendNotification } = require("../utils/sendNotification");
require("dotenv").config();

async function sendDueDateReminders() {
  console.log("📆 Running due date reminder job...");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ DB connected for due date reminder.");

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const loans = await loanModel.find({
      returned: false,
      dueDate: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    console.log(`🔍 Found ${loans.length} loans due tomorrow.`);

    for (const loan of loans) {
      const userId = loan.userId[0];
      const user = await userModel.findById(userId).lean();
      const book = await loan.populate("bookId");

      if (!user || !user.email) {
        console.warn(`⚠️ No email for user ${userId}`);
        continue;
      }

      const dueDate = new Date(loan.dueDate).toLocaleDateString();

      await sendNotification({
        userId,
        title: "📅 Book Due Tomorrow",
        message: `Reminder: Your book "${book.bookId.title}" is due on ${dueDate}. Please return it on time to avoid a fine.`,
        type: "reminder",
        email: user.email,
      });

      console.log(`✅ Notification sent to user ${user.email}`);
    }

    console.log("🎉 Due date reminders complete.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Failed to send due date reminders:", err);
    process.exit(1);
  }
}

sendDueDateReminders();
