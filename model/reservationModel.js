const { default: mongoose } = require("mongoose");

const reservationSchema = new mongoose.Schema({
    userId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    bookId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"book"
    },
    reservationDate:{
        type:Date,
        default:Date.now
    },
    status:{
        type:String,
        enum:["pending","fullfilled","cancelled"],
        default:"pending"
    }
},{timestamps:true})

const reservationModel = mongoose.models.reserves || mongoose.model("reserves", reservationSchema);

module.exports = { reservationModel };

