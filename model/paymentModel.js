// paymentmodel.js
const { default: mongoose } = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    amount: {
        type: Number,
        required: true
        
    },
    paymentMethod: {
        type: String,
        enum: ["chapa", "telebirr", "abisinia"],
        default: "chapa"
    },
    referenceId: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);