// router/paymentRouter.js
const express = require('express');
const router = express.Router();
const PaymentController = require('../controller/paymentController');
const { checkUser } = require('../controller/authController');

// Public endpoints
router.post('/initiate', checkUser, PaymentController.initiatePayment);
router.post('/verify/:paymentId', PaymentController.verifyPayment); // Webhook doesn't need auth

// Authenticated routes


router.use(checkUser);
router.get('/history', checkUser, PaymentController.getPaymentHistory);
router.post('/webhook', express.raw({type: 'application/json'}), PaymentController.handleWebhook);


router.get('/debug', (req, res) => {
    console.log('Request user:', req.user);
    res.json({ 
      user: req.user,
      headers: req.headers,
      cookies: req.cookies
    });
  });

module.exports = router;
