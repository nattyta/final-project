const { default: mongoose } = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    paymentMethod:{
        type:String,
        enum:["cash","card","online"]
    },
    referenceId:{
        type:String, //for transaction id
    },
    description:{
        type:String
    }
},{timestamps:true})