const { default: mongoose, }= require("mongoose")
const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:[true, "user name is required."]
    },
    lastname:{
        type:String,
        required:[true, "user name is required."]
    },
    email:{
        type:String,
        required:[true, "email is required."],
        unique:true
    },
    password:{
        type:String,
        required:[true, "password is required."]
    },
    phoneNumber:{
        type:String,
        required:true
    },
    membership_date:{
        type:Date,
        default:Date.now
    },
},{timestamps:true})


const userModel = mongoose.model("user",userSchema)

module.exports = { userModel }