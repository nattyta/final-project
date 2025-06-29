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

const checkUser = async (req, res, next) => {
    try {
      // Get token from either cookie or Authorization header
      let token;
      if (req.cookies.jwt) {
        token = req.cookies.jwt;
      } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }
  
      if (!token) {
        console.log('No token found in request');
        return res.status(401).json({ message: "Authentication required" });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
  
      // Get fresh user from database
      const user = await userModel.findById(decoded.id).select('-password');
      console.log('Found user:', user);
  
      if (!user) {
        console.log('User not found in database');
        return res.status(404).json({ message: "User not found" });
      }
  
      // Attach essential user data to request
      req.user = {
        _id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        phoneNumber: user.phoneNumber
      };
      
      console.log('Attached user to request:', req.user);
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      }
      res.status(500).json({ message: "Authentication failed" });
    }
  };

module.exports = { signup, login, checkUser }