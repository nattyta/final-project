const { bookModel } = require("../model/bookModel")

const getAllbooks = async(req,res)=>{
    try {
        const books = await bookModel.find()
        res.status(200).json({
            success:true,
            books
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const getBookById = async(req,res)=>{
    try {
        const book = await bookModel.findById(req.params.id)
        if(!book){
            res.status(404).json({
                message:"book not found."
            })
            return
        }
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const uploadBook = async(req,res)=>{
    
    try {
        
    } catch (error) {
        
    }
}

const updateBook = async(req, res)=>{
    try {
        
    } catch (error) {
        
    }
}

const deleteBook = async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}

const loanBook = async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}

const reserveBook = async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}

module.exports = {
    getAllbooks,
    getBookById,
    uploadBook,
    updateBook,
    deleteBook,
    loanBook,
    reserveBook
}