const { bookModel } = require("../model/bookModel")
const { loanModel } = require("../model/loanModel")
const { reservationModel } = require("../model/reservationModel")
const fs = require("fs")
const { calculateFine } = require("../utils/calculateFee")
const { userModel } = require("../model/userModel")
const { createFinePayment } = require('../services/finePaymentService')
const { sendNotification } = require("../utils/sendNotification"); // adjust path if needed

const getHardCopyBooks = async(req, res)=>{
    try {
        const query = req.query
        const hardCopyBooks = await bookModel.find({isHardCopy:true})

        if(!hardCopyBooks){
            res.status(404).json({
                message:"there is no hard copy books."
            })
            return;
        }
        res.status(200).json({
            success:true,
            book:hardCopyBooks
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
        console.log(error)
    }
}
const getAllbooks = async(req,res)=>{
    console.log("get all book route fired")

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
        res.status(200).json({
            success:true,
            book
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}



const uploadBook = async(req,res)=>{
    console.log("upload book route fired")
    const book = req.files['book']?.[0].originalname || '';
    const coverImage = req.files['coverImage']?.[0].originalname || '';
    try {
        console.log(req.body)
        let isHardCopy;
        if(req.body.type ==='hardcopy'){
            isHardCopy = true
        }
        console.log(isHardCopy)
        const uploadedBook = new bookModel({
            ...req.body,
            book:book,
            coverImage:coverImage,
            isHardCopy,
            available_copies:req.body.total_copies
            })

            const saved = await uploadedBook.save();
        res.status(200).json({ 
            book:saved
        })

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
        console.log(error.message)
    }
  
}

const updateBook = async(req, res)=>{
    console.log("update book route fires")
    try {
        const bookfile = req.files['book']?.[0].originalname || '';
        const coverImage = req.files['coverImage']?.[0].originalname || '';
        const updatedBook = await bookModel.findByIdAndUpdate(req.params.id,
                                                        {
                                                        ...req.body,
                                                        book:bookfile,
                                                        coverImage:coverImage
                                                        })
            res.status(200).json({message:"book updated successfully." })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
        console.log(error)
    }
}

const deleteBook = async(req,res)=>{
    const bookId = req.params.id
    console.log("delete book route fired")
    try {
        if(!bookId){
            res.status(404).json({
                error:"book not found."
            })
            return
        }
        await bookModel.findByIdAndDelete(bookId)
        res.status(204).json({
            message:"successfully deleted the book"
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const loanBook = async(req,res)=>{
    console.log("loan book route fires")
    const userId = req.body.userId
    const bookId = req.params.id
    
    try { 
        const loans = await loanModel.find({userId, returned:false})
        const book = await bookModel.findById(bookId)
        const reservations = await reservationModel.find();
        


        if(!book){
            res.status(404).json({
                message:"book not found."
            })
            return
        }
        console.log("UserId from body:", userId)
        console.log("Loan query result:", loans)

        let prevLoan = Array.isArray(loans) ? loans.findIndex(loan => loan.userId.includes(userId)) : -1;
        let prevReservation = reservations.findIndex(res => res.userId.includes(userId));
        console.log(prevLoan)
        
        if(prevLoan == -1){
            if(book.available_copies > 0 && book.status == "available"){
               let loan = new loanModel({
                    bookId:bookId,
                    issueDate:new Date(),
                    dueDate:new Date(new Date().setDate(new Date().getDate() - 5))
                })
                loan.userId.push(userId)
                const loaned = await loan.save();
                res.status(200).json({
                    success:true,
                    loaned
                })
    
                if (loaned) {
                    book.available_copies--;
                    await book.save();
                  
                    
                    const user = await userModel.findById(userId);
                    const dueDate = new Date(loaned.dueDate).toLocaleDateString();
                  
                    await sendNotification({
                      userId,
                      title: "📚 Book Loaned Successfully",
                      message: `You have borrowed "${book.title}". Please return it by ${dueDate}.`,
                      type: "reminder",
                      email: user.email
                    });
                  }

                


            }else{
                res.status(404).json({
                    message:"book is not availabe in our catalog. we will inform you when book is available."
                })
            }
        }
        else{
            res.status(400).json({
                message:"you must return loaned book in order to loan new one."
            })
        }
        if(prevReservation == -1){
          
            if(prevLoan == -1 ){
                let reservation = new reservationModel({
                    userId:userId,
                    bookId:book,
                    reservationDate:Date.now(),
                    status:"pending"
                })
                
                await reservation.save();
                res.status(200).json({
                })
                return

            }
            res.status(403).json({
                message:"you must return loaned book in order to loan new one."
            })

        }else{
            res.status(400).json({
                message:"you already have previous reservation."
            })
        }
        if(prevLoan == 0){
            res.status(400).json({
                message:"you must return loaned book in order to loan new one."
            })
        }


    } catch (error) {
        res.status(500).json({
            error
        })
        console.log(error)
    }
}

const returnBook = async(req,res)=>{
    try {
     const{ userId, bookId }= req.body
     let loans = await loanModel.findOne({ userId: { $in: [userId] }, bookId, returned: false });


        if(!loans){
            console.log("there is no loan")
            res.status(400).json({
                message:"you are not loaned any book"
            })
        }
        else{
            const book = await bookModel.findOne({_id:bookId})
            if(book){
                console.log("total book: ",book.total_copies)
                console.log("available book: ",book.available_copies)

                //if available book less than total book
                const upRtn = await loanModel.findOne({userId, bookId, returned:false})
                let returnAt = new Date();
                console.log("📆 Due Date:", upRtn.dueDate);
                console.log("📆 Return Date:", returnAt);
                
                    
                    
                    let fee;
                    if(returnAt > upRtn.dueDate){
                        fee = calculateFine(upRtn.dueDate, returnAt)
                        const user = await userModel.findOne({_id:userId})
                        upRtn.fine = fee
                        await upRtn.save();
                        await createFinePayment(userId, upRtn._id, fee);
                        
                    }
                    upRtn.returned = true
                    upRtn.returnDate = returnAt
                    if(book.available_copies < book.total_copies){
                        book.available_copies++
                    }
                    await upRtn.save()
                    await book.save();
                        res.status(200).json({
                            message:"returned successfully.",
                            fee: fee > 0 ? fee : null
                        })

               
            }
        }

 } catch (error) {
    res.status(500).json({
        error:error.message
    })
 }
}




const reserveBook = async(req,res)=>{}



module.exports = {
    getAllbooks,
    getBookById,
    uploadBook,
    updateBook,
    deleteBook,
    loanBook,
    returnBook,
    getHardCopyBooks
}