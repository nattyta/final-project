const mongoose = require("mongoose")
const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, "book title is required."]
    },
    author:{
        type:String,
        required:[true, "Author is required"]
    },
    isbn:{
        type:String
    },
    genre:{
        type:String
    },
    total_copies:{
        type:Number,
        default:1
    },
    available_copies:{
        type:Number
    }
},{timestamps:true})

const bookModel = mongoose.model("books",bookSchema)
module.exports = { bookModel }