const PaymentService = require('../services/paymentService');

class PaymentController {
  static async initiatePayment(req, res) {
    try {
      const { amount, description } = req.body;
      
      const result = await PaymentService.initializePayment({
        userId: req.user._id,
        amount,
        description,
        email: req.user.email,
        phone: req.user.phoneNumber,
        firstName: req.user.firstname,
        lastName: req.user.lastname
      });

      res.json({
        success: true,
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async verifyPayment(req, res) {
    try {
      const payment = await PaymentService.verifyPayment(req.params.paymentId);
      
      if (payment.status === 'completed') {
        // Handle successful payment (e.g., update user credits)
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
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      const payments = await Payment.find({ userId: req.user._id })
        .sort({ createdAt: -1 });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


  // In paymentController.js
static async handleWebhook(req, res) {
  const signature = req.headers['chapa-signature'];
  const payload = req.body;

  try {
    // Verify signature (implement verification logic)
    if (!this.verifySignature(signature, payload)) {
      return res.status(400).send('Invalid signature');
    }

    const payment = await PaymentService.verifyPayment(payload.tx_ref);
    res.status(200).send('Webhook received');
  } catch (error) {
    res.status(400).send('Webhook processing failed');
  }
}


}

module.exports = PaymentController;