const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { loanModel } = require("../model/loanModel");
const { userModel } = require("../model/userModel");
const { bookModel } = require("../model/bookModel");
const { sendNotification } = require("../utils/sendNotification");

dotenv.config();

async function sendOverdueReminders() {
  try {
    console.log("📆 Running overdue reminder job...");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ DB connected for overdue reminders.");

    const today = new Date();

    const overdueLoans = await loanModel.find({
      returned: { $ne: true },
      dueDate: { $lt: today },
      reminderSent: { $ne: true }, // ✅ Prevent duplicates
    });

    console.log(`🔍 Found ${overdueLoans.length} overdue loans.`);

    for (const loan of overdueLoans) {
      const user = await userModel.findById(loan.userId);
      const book = await bookModel.findById(loan.bookId);

      if (!user || !book) continue;

      const daysOverdue = Math.floor(
        (today - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24)
      );

      const message = `You have not returned "${book.title}" and it's now ${daysOverdue} days overdue. Please return it as soon as possible to avoid further fines.`;

      await sendNotification({
        userId: user._id,
        title: "📢 Book Overdue Reminder",
        message,
        type: "reminder",
        email: user.email,
      });

      // ✅ Mark as reminded
      loan.reminderSent = true;
      await loan.save();
    }

    console.log("✅ Overdue reminders sent.");
    process.exit();
  } catch (error) {
    console.error("❌ Failed to send overdue reminders:", error);
    process.exit(1);
  }
}

sendOverdueReminders();
