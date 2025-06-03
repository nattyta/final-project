const { checkUser } = require("../controller/authController")
const { 
    getAllbooks,
    getBookById,
    uploadBook,
    updateBook, 
    deleteBook ,
    loanBook,
    reserveBook
} = require("../controller/bookController")

const bookRouter = require("express").Router()


bookRouter.get("/book/reserve/:id", reserveBook)
bookRouter.get("/book/order/:id",loanBook)
bookRouter.get("/books",getAllbooks)
bookRouter.get("/book/:id",getBookById)
bookRouter.post("/book", uploadBook)
bookRouter.patch("/book/:id",updateBook)
bookRouter.delete("/book/:id",deleteBook)


module.exports = { bookRouter }