const cron = require('node-cron');
const { loanModel } = require('../model/loanModel');
const { calculateFine } = require('../utils/calculateFee');
const { createFinePayment } = require('../services/finePaymentService');

cron.schedule('0 0 * * *', async () => {
    console.log("🔁 Running daily fine check...");

    const overdueLoans = await loanModel.find({
        returned: false,
        dueDate: { $lt: new Date() },
        fine: { $exists: false }
    });

    for (let loan of overdueLoans) {
        const fine = calculateFine(loan.dueDate, new Date());
        loan.fine = fine;
        await loan.save();

        await createFinePayment(loan.userId[0], loan._id, fine);
        console.log(`💸 Fine triggered for loan ${loan._id}`);
    }

    console.log("✅ Daily fine job completed.");

    createNotification({
        userId: loan.userId[0],
        title: "Overdue Book",
        message: "Your book is overdue. A fine has been added.",
        type: "warning"
      });
      
});
