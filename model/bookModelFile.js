const {  default: mongoose } = require("mongoose")

const bookSchema = new mongoose({
    name:String,
    file:String
})

const bookFileModel = mongoose.model("bookFile", bookSchema)
module.exports = { bookFileModel }