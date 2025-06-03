const express = require('express');
const PaymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Initialize payment
router.post('/initiate', PaymentController.initiatePayment);

// Verify payment (callback from Chapa)
router.get('/verify/:paymentId', PaymentController.verifyPayment);

// Get user payment history
router.get('/history', PaymentController.getPaymentHistory);

router.post('/webhook', express.raw({type: 'application/json'}), PaymentController.handleWebhook);

module.exports = router;