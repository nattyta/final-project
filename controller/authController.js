const { userModel } = require("../model/userModel");
const { hashPassword } = require("../utils/hashPassword");
const { generateJwtToken } = require("../utils/jwtToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();



const signup = async(req,res)=>{
    console.log("signup controller fired")
    const { firstname,lastname,email,password,phoneNumber } = req.body
    try {
        const hashedPassword = await hashPassword(password)
        const User = new userModel({
            firstname,
            lastname,
            email,
            password:hashedPassword,
            phoneNumber
        })

        let user = await User.save();

        if(!user){
            res.status(400).json({
                message:"unable to create user."
            })
            return
        }

        res.status(201).json({
            success:true,
            user
        })

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}


const login = async(req, res)=>{
    const{email, password} = req.body
    try {
        const user = await userModel.findOne({email})

        if(!user){
            res.status(404).json({
                message:"user not found"
            })
            return
        }
        const ispasswordCorrect = await bcrypt.compare(password, user.password)

        if(!ispasswordCorrect){
            res.status(400).json({
                message:"Incorrect password."
            })
            return;
        }

        if(ispasswordCorrect && user){
            const token = await generateJwtToken(user._id)
            res.cookie("jwt", token)
            res.status(200).json({
                user,
                token
            })
        }
        
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const checkUser = async(req,res, next)=>{
    try {
        // console.log(req.cookies)
        const token = req.cookies.jwt
        if(!token){
            res.status(400).json({
                message:"you are not logged in! please login."
            })
            return
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
            if(err){
                res.status(400).json({
                    message:"Something went Wrong! try again later"
                })
                return
            }
            req.user = user
            next()
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

const checkrole = async(role)=>{
    return(req,res,next)=>{
        
    }
}


module.exports = { signup, login, checkUser }