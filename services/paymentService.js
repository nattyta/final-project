const axios = require('axios');
const Payment = require('../model/paymentModel');
const { loanModel } = require('../model/loanModel');
const { userModel } = require("../model/userModel");

class PaymentService {
  // 🔁 Handles the payment init logic and delegates to startPayment
  static async initializePayment(req, res) {
   
    try {
      const { amount, loanId, description } = req.body;
      const user = req.user;

      let finalAmount = amount;
      if (finalAmount !== undefined && finalAmount !== null && finalAmount !== "") {
        finalAmount = Number(finalAmount);
        console.log("📌 Converted loan.fine to number:", finalAmount);
      }
      
      let finalDescription = description || "Library payment";

      console.log("🧪 req.body:", req.body);
      console.log("🧪 amount:", amount, "| typeof:", typeof amount);
      console.log("🧪 loanId:", loanId);
      console.log("🧪 user.email:", user?.email);

      if ((finalAmount === undefined || finalAmount === null || finalAmount === "") && loanId) {
        console.log("✅ Entered fallback logic to fetch fine from DB");

        const loan = await loanModel.findById(loanId);
        console.log("📌 Loan lookup result:", loan);

        if (!loan) {
          return res.status(400).json({
            success: false,
            message: "Loan not found"
          });
        }

        if (loan.fine !== null && typeof loan.fine === "number" && loan.fine > 0)          {
          finalAmount = loan.fine;
          finalDescription = `Overdue fine for loan ${loanId}`;
          console.log("💰 Fetched fine from loan:", finalAmount);
        } else {
          return res.status(400).json({
            success: false,
            message: "Fine not found or zero"
          });
        }
      }

      console.log("📦 finalAmount:", finalAmount);
      console.log("📧 user.email:", user?.email);

      if (typeof finalAmount !== "number" || !user?.email) {
        return res.status(400).json({
          success: false,
          message: 'Amount and user email are required'
        });
      }

      console.log("🧾 Debug Payment Call:");
      console.log("➡️ finalAmount:", finalAmount, "| typeof:", typeof finalAmount);
      console.log("➡️ user.email:", user.email);
      console.log("➡️ full payload:", {
       userId: user._id,
       loanId,
       amount: finalAmount,
       email: user.email,
       firstName: user.firstname,
       lastName: user.lastname,
  phone: user.phoneNumber,
  description: finalDescription
});

      const result = await PaymentService.startPayment({
        userId: user._id,
        loanId,
        amount: finalAmount,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        phone: user.phoneNumber,
        description: finalDescription
      });

      return res.json({
        success: true,
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl
      });

    } catch (error) {
      console.error("🔥 Error in initializePayment:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 🚀 Actually initializes payment with Chapa
  static async startPayment({ userId, loanId, amount, email, firstName, lastName, phone, description }) {
    const txRef = `tx-${Date.now()}`;
  
    const finalAmount = Number(amount);
    console.log("💡 finalAmount before sending to Chapa:", finalAmount, "| typeof:", typeof finalAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      throw new Error("Invalid amount passed to Chapa");
    }
  
    const finalEmail = (email || "").toLowerCase().trim();
    if (!finalEmail || !finalEmail.includes("@")) {
      throw new Error("Invalid email passed to Chapa");
    }
  
    const payload = {
      amount: finalAmount.toFixed(2).toString(),
      currency: "ETB",
      email: finalEmail,
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      tx_ref: txRef,
      callback_url: "http://localhost:5000/api/payment/webhook",
      return_url: "http://localhost:3000/payment/success",
      customization: {
        title: "Library Payment",
        description
      }
    };
  
    console.log("📤 Payload to Chapa:", payload);
  
    const response = await axios.post("https://api.chapa.co/v1/transaction/initialize", payload, {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
      }
    });
  
    const data = response.data?.data;
  
    const payment = await Payment.create({
      userId,
      loanId,
      amount: finalAmount,
      paymentId: data.tx_ref,
      referenceId: txRef,
      description,
      paymentMethod: "chapa",
      status: 'pending'
      
    });
  
    return {
      paymentId: payment.paymentId,
      checkoutUrl: data.checkout_url
    };
  }
  
  

  // ✅ Verifies payment status
  static async verifyPayment(req, res) {
    try {
      const payment = await Payment.findOne({ paymentId: req.params.paymentId });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found"
        });
      }

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
  static async createFinePayment(userId, loanId, amount) {
    try {
      const user = await userModel.findById(userId);
      if (!user || !user.email) {
        throw new Error("User not found or missing email.");
      }
  
      const result = await PaymentService.startPayment({
        userId,
        loanId,
        amount,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        phone: user.phoneNumber,
        description: `Overdue fine for loan ${loanId}`
      });
  
      return result;
  
    } catch (error) {
      console.error("🚨 createFinePayment error:", error);
      throw new Error("Failed to create fine payment: " + error.message);
    }
  }
  
}

module.exports = PaymentService;
