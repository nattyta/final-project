const { userModel } = require("../model/userModel")
const { CustomError } = require("../utils/customErrorHandler")
const { hashPassword } = require("../utils/hashPassword")

const createUser = async(req,res, next)=>{
        const{email,password} = req.body
        console.log(req.body)
    let numbers = "1234567890"
    let str = ''
    
    for(let i = 0; i <= 3; i++){
        const randIndex = Math.floor(Math.random() * numbers.length)
        str += numbers[randIndex]
    }
    let ID = "HCPL-"+str
    try {
        const user = await userModel.findOne({email})
        if(user){
            res.status(400).json({
                error:"user with this email already exist."
            })
            return
        }
        const hashedPassword = await hashPassword(password)
        
        const User = await userModel.create({id:ID,...req.body, password:hashedPassword})

        let savedUser = await User.save();
        console.log(savedUser)
        if(!savedUser){
            res.status(400).json({
                message:"unable to create user."
            })
            return
        }

        res.status(201).json({
            success:true,
            savedUser
        })

    } catch (error) {
        console.log(error)
      let Error = new CustomError(error.message,error.status)
      next(Error)
    }
}
const getAllUser = async(req, res)=>{
    try {
        console.log("get all user request received")
        const allUser = await userModel.find();
        res.status(200).json({
            success:true,
            allUser
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const getUserById = async(req, res)=>{
    try {
        const user = await userModel.findById(req.params.id)
        if(!user){
            res.status(404).json({
                message:"User not found."
            })
            return;
        }
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        res.status(200).json({
            error:error.message
        })
    }
}

const updateUser = async(req,res)=>{
    console.log("update user route fires")
    console.log(req.params.id)
    try {
        const user = await userModel.findById(req.params.id)

        if(!user){
            res.status(404).json({
                message:"user not found"
            })
            return
        }
        const updatedUser = await user.updateOne(req.body)
        res.status(200).json({
            success:true,
            updateUser
        })

    } catch (error) {
        console.log(error)
    }
}

const deleteUser = async(req,res)=>{
    console.log("delete user route called")
    try {
        const user = await userModel.findOne({ id: req.params.id });
        if(!user){
            res.status(404).json({
                message:"user not found."
            })
            return
        }
        await userModel.deleteOne({ id:user.id })
        res.status(401).json({
            success:true,
            user
        })

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const userStatistics = async(req,res)=>{
    try {
        const stat = await userModel.aggregate()
    } catch (error) {
        
    }
}

const notifyUser = async(req, res)=>{
    let userId = req.userId
    let overDueLoan = await loanModel.find({returnDate:{$lt:Date.now}, returned:false})
    overDueLoan.map(async(user)=>{
        if(user.userId.includes(userId)){
            let user = await userModel.findById(userId)

            //notfication logic goes here

            return
        }
    })
}
const getUserByEmail = async(req, res, next) => {
    try {
        const user = await userModel.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        // Return the user ID
        return res.status(200).json({
            userId: user.id
        });
    } catch (error) {
        console.log(error);
        let Error = new CustomError(error.message, error.status);
        next(Error);
    }
}

module.exports = { 
    getAllUser, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser, 
    userStatistics,
    notifyUser
}