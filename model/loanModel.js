const { default: mongoose } = require("mongoose");

const loanSchema = new mongoose.Schema({
    userId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    copyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"bookCopy"
    },
    issueDate:{
        type:Date,
        default:Date.now
    },
    dueDate:{
        type:Date
    },
    returnDate:{
        type:Date
    },
    fine:{
        type:Number
    }
},{timeseries:true})

const loanModel = mongoose.model("loan",loanSchema)

model.exports = { loanModel }