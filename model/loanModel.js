const { default: mongoose } = require("mongoose");

const loanSchema = new mongoose.Schema({
    userId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    bookId: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: "book"
      },
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
        default: null
    },

    paid: {
        type: Boolean,
        default: false
    },

    verificationCode: {
        type: String,
        required: function () {
          return this.isNew; 
        }
      },
      verificationStatus: {
        type: Boolean,
        default: false
      },

      reminderSent: {
        type: Boolean,
        default: false
      }
      

},{timeseries:true})

const loanModel = mongoose.model("loan",loanSchema)

module.exports = { loanModel }