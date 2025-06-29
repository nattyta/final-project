const PaymentService = require('./paymentService');
const { userModel } = require('../model/userModel');

async function createFinePayment(userId, loanId, fineAmount) {
  if (!userId || !loanId || !fineAmount) {
    throw new Error("❌ Missing required parameters for fine payment");
  }

  // Fetch user info
  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error("❌ User not found for fine payment");
  }

  // Initialize payment using Chapa
  const result = await PaymentService.initializePayment({
    userId,
    loanId,
    amount: fineAmount,
    email: user.email,
    firstName: user.firstname,
    lastName: user.lastname,
    phone: user.phoneNumber,
    description: `Overdue fine for loan ${loanId}`
  });

  return result; // contains { paymentId, checkoutUrl }
}

module.exports = { createFinePayment };
