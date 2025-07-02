    const { bookModel } = require("../model/bookModel")
    const { loanModel } = require("../model/loanModel")
    const { reservationModel } = require("../model/reservationModel")
    const fs = require("fs")
    const { calculateFine } = require("../utils/calculateFee")
    const { userModel } = require("../model/userModel")
    const PaymentService = require('../services/paymentService');
    const { sendNotification } = require("../utils/sendNotification"); 
    const { checkUser } = require("../controller/authController")

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

    const crypto = require("crypto"); // Make sure to require this at the top
    const { sendEmail } = require("../utils/emailService");
    
    const loanBook = async (req, res) => {
      console.log("loan book route fires");
      const userId = req.body.userId;
      const bookId = req.params.id;
    
      try {
        const loans = await loanModel.find({ userId });
        const hasUnpaidFines = loans.some(loan => loan.fine !== null && loan.fine > 0 && !loan.paid);
        const hasUnreturnedBooks = loans.some(loan => !loan.returned);
    
        if (hasUnpaidFines) {
          return res.status(403).json({
            message: "You have unpaid fines. Please complete your payment before borrowing new books."
          });
        }
    
        if (hasUnreturnedBooks) {
          return res.status(403).json({
            message: "You must return your current loaned books before borrowing a new one."
          });
        }
    
        const book = await bookModel.findById(bookId);
        if (!book) {
          return res.status(404).json({ message: "Book not found." });
        }
    
        if (book.available_copies > 0 && book.status == "available") {
          // 👇 generate random 6-digit verification code
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
          let loan = new loanModel({
            bookId: bookId,
            issueDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
            verificationCode, // ⬅️ save the code
            userId: [userId]   // push userId into array
          });
    
          const loaned = await loan.save();
    
          book.available_copies--;
          await book.save();
    
          const user = await userModel.findById(userId);
          const dueDate = new Date(loaned.dueDate).toLocaleDateString();
    
          // 📣 Send notification
          await sendNotification({
            userId,
            title: "📚 Book Loaned Successfully",
            message: `You have borrowed "${book.title}". Please return it by ${dueDate}. Your verification code is: ${verificationCode}`,
            type: "reminder",
            email: user.email
          });
    
          return res.status(200).json({
            success: true,
            loaned,
            verificationCode
          });
    
        } else {
          return res.status(404).json({
            message: "Book is not available in our catalog. We will inform you when it becomes available."
          });
        }
    
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    };
    
    
      

      const returnBook = async (req, res) => {
        try {
          const { userId, bookId } = req.body;
      
          const upRtn = await loanModel.findOne({
            userId: { $in: [userId] },
            bookId,
            $or: [{ returned: false }, { returned: { $exists: false } }]
          });
          


          
          console.log("📨 Request Body:", req.body);
          console.log("🔍 Looking for loan with userId:", userId, "and bookId:", bookId);

      
          if (!upRtn) {
            console.log("there is no loan");
            return res.status(400).json({ message: "You are not loaned any book" });
          }
      
          const book = await bookModel.findOne({ _id: bookId });
      
          if (!book) {
            return res.status(404).json({ message: "Book not found." });
          }
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
      
          console.log("total book: ", book.total_copies);
          console.log("available book: ", book.available_copies);
      
          const user = await userModel.findOne({ _id: userId });
      
          let returnAt = new Date();
          let fee;
          let daysLate;
          let checkoutUrl = null;
      
          console.log("📆 Due Date:", upRtn.dueDate);
          console.log("📆 Return Date:", returnAt);
      
          if (returnAt > upRtn.dueDate) {
            fee = calculateFine(upRtn.dueDate, returnAt);
            daysLate = Math.floor((returnAt - upRtn.dueDate) / (1000 * 60 * 60 * 24));
            upRtn.fine = fee;
            await upRtn.save();
      
            const payment = await PaymentService.createFinePayment(userId, upRtn._id, fee);

              if (payment && payment.checkoutUrl) {
             checkoutUrl = payment.checkoutUrl;
             } else {
             console.warn("❗️No checkout URL returned from createFinePayment");
              }

          }
      
          upRtn.returned = true;
          upRtn.returnDate = returnAt;
      
          if (book.available_copies < book.total_copies) {
            book.available_copies++;
          }
      
          await upRtn.save();
          await book.save();
      
          // 📣 SEND NOTIFICATION
          // 📣 SEND NOTIFICATION
console.log("📣 Preparing to send in-app notification...");

const notificationPayload = {
  userId,
  title: fee > 0
    ? "📚 Book Returned Late"
    : "✅ Book Returned",
  message: fee > 0
    ? `You returned "${book.title}" ${daysLate} days late. You owe ${fee.toFixed(2)} birr. You cannot borrow books until payment is made.`
    : `You have returned "${book.title}". Thank you!`,
  type: fee > 0 ? "fine" : "info",
  ...(fee > 0 && checkoutUrl ? { actionUrl: checkoutUrl } : {})
};

console.log("📦 Notification Payload:", notificationPayload);

await sendNotification(notificationPayload);

console.log("✅ In-app notification sent successfully");

return res.status(200).json({
  message: "Returned successfully.",
  fee: fee > 0 ? fee : null,
  checkoutUrl
});

         
      
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: error.message });
        }
      };
      



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