const { checkUser } = require("../controller/authController")

const { 
    getAllbooks,
    getBookById,
    uploadBook,
    updateBook, 
    deleteBook ,
    loanBook,
    reserveBook,
    returnBook,
    getHardCopyBooks
} = require("../controller/bookController")
const { upload } = require('../uploads/fileUploads');


const bookRouter = require("express").Router()


bookRouter.post("/book/order/:id", loanBook)
bookRouter.get('/books/hardCopy', getHardCopyBooks)
bookRouter.get("/books", getAllbooks)
bookRouter.get("/book/:id",checkUser, getBookById)

bookRouter.post("/book", upload.fields([
    { name: 'book', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]), uploadBook)

bookRouter.patch("/book/:id",
    upload.fields([
        { name: 'book', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
      ])
    ,updateBook)
bookRouter.delete("/book/delete/:id",deleteBook)
bookRouter.post("/book/return", returnBook)
module.exports = { bookRouter }