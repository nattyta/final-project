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
    book:{
        type:String,
    },
    coverImage:{
        type:String
    },
    isbn:{
        type:String
    },
    format:{
        type:String,
        enum:["epub", "pdf"]
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    isHardCopy:{
        type:Boolean,
        default:false
    },
    category:{
        type:String,
        enum:['Fiction', 'Tech', "Biography", "Science"]
    },
    total_copies:{
        type:Number,
        default:1
    },
    available_copies:{
        type:Number,
        default:1
    },
    publisher:{
        type:String
    },
    status:{
        type:String,
        enum:["available","unavailable","issued","damaged","lost","checkedout"],
        default:"available"
    },
    publicationYear:{
        type:Date
    },
    description:{
        type:String
    }
},{timestamps:true})

const bookModel = mongoose.model("books",bookSchema)
module.exports = { bookModel }