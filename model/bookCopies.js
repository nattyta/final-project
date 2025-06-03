const mongoose = require("mongoose")

const bookCopy = new mongoose.Schema({
    bookId:{
        type:mongoose.Schema.ObjectId,
        ref:"books"
    },
    status:{
        type:String,
        enum:["available","issued","damaged","lost"],
        default:"available"
    },
},{timestamps:true})

const copyModel = mongoose.model("bookCopy", bookCopy)
module.exports = { copyModel }