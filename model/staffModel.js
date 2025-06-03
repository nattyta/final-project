const { default: mongoose } = require("mongoose");

const staffSchema = new mongoose.Schema({

},{timestamps:true})

const staffModel = mongoose.model("staff", staffSchema)