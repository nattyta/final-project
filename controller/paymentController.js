const PaymentService = require('../services/paymentService');
const Payment = require('../model/paymentModel');
const { loanModel: Loan } = require('../model/loanModel');

class PaymentController {
  static async initiatePayment(req, res) {
    try {
      const { amount, loanId, description } = req.body;

      console.log("🔍 initiatePayment - req.user:", req.user);
      console.log("🔍 initiatePayment - req.body:", req.body);

      if (!req.user?.email) {
        return res.status(400).json({
          success: false,
          message: 'User email is required'
        });
      }

      let finalAmount = amount;

      // If amount not provided, fallback to loan fine
      if (!finalAmount && loanId) {
        const loan = await Loan.findById(loanId);
        if (!loan) {
          return res.status(404).json({
            success: false,
            message: 'Loan not found'
          });
        }
        finalAmount = loan.fine;
        console.log("💰 Fetched fine from loan:", finalAmount);
      }

      if (!finalAmount || isNaN(finalAmount)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount provided or found'
        });
      }

      // 👇 FIX: Convert amount to proper format for Chapa
      const formattedAmount = Number(finalAmount).toFixed(2).toString();

      const result = await PaymentService.startPayment({
        userId: req.user._id,
        loanId,
        amount: formattedAmount,
        email: req.user.email.toLowerCase().trim(),
        phone: req.user.phoneNumber,
        firstName: req.user.firstname,
        lastName: req.user.lastname,
        description: description || `Overdue fine for loan ${loanId || ''}`
      });

      console.log("✅ Sending response with payment data:", {
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl
      });

      return res.json({
        success: true,
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl
      });

    } catch (error) {
      console.error('🔥 Payment Controller Error:', error);

      const message = error.response?.data?.message || error.message || 'Payment initiation failed';

      return res.status(400).json({
        success: false,
        message
      });
    }
  }
  static async verifyPayment(req, res) {
    try {
      const payment = await PaymentService.verifyPayment(req.params.paymentId);

      if (payment.status === 'completed') {
        return res.json({ 
          success: true, 
          message: 'Payment verified successfully' 
        });
      }

      res.json({ 
        success: false, 
        message: 'Payment verification failed or pending' 
      });
    } catch (error) {
      console.error('❌ verifyPayment Error:', error);

      res.status(400).json({
        success: false,
        message: typeof error.message === 'string' 
          ? error.message 
          : JSON.stringify(error.message)
      });
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      console.log("🔥 getPaymentHistory triggered for", req.user._id);
      const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.json(payments);
      console.log("📦 Payments fetched:", payments);
    } catch (error) {
      console.error('❌ getPaymentHistory Error:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Could not fetch payment history'
      });
    }
  }

  static async handleWebhook(req, res) {
    const signature = req.headers['chapa-signature'];
    const payload = req.body;
  
    try {
      if (!this.verifySignature(signature, payload)) {
        return res.status(400).send('Invalid signature');
      }
  
      console.log("📦 Webhook Payload:", payload);
  
      const txRef = payload.tx_ref;
      const chapaStatus = payload.status;
      const chapaMethod = payload.payment_method; // 📌 from Chapa
  
      const payment = await Payment.findOne({ referenceId: txRef });
      if (!payment) {
        return res.status(404).send('Payment record not found');
      }
  
      if (chapaStatus === 'success') {
        payment.status = 'completed';
        payment.paymentMethod = chapaMethod || 'telebirr'; // fallback
        await payment.save();
      }
  
      res.status(200).send('Webhook received');
  
    } catch (error) {
      console.error('❌ Webhook Error:', error);
      res.status(400).send('Webhook processing failed');
    }
  }
  
}

module.exports = PaymentController;
