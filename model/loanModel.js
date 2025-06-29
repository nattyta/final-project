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
        type:Number,
        required: true
    },

    paid: {
        type: Boolean,
        default: false
    }

},{timeseries:true})

const loanModel = mongoose.model("loan",loanSchema)

module.exports = { loanModel }