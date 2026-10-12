const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");


//auth

exports.auth = async(req, res, next) => {
    try{
        //extract token
        const token = req.cokkies.token || req.body.token || req.header("Authorisation").replace("Bearer", "");

        //If token misssing, than return responce

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token us Missing",
            });

        }

        //Verify the token 

        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;


        }

        catch(err){
            //verification issue
            return res.status(401).json({
                sucess:false,
                message: 'Token is invalid',

            })

        }
        next();

    }

    catch(error){
        return res.status(401).json({
            success: false,
            message:'Something went wrong while validating the token',
        });

    }
}

//isStuden
exports.isStudent = async (req, res, next)=>{
    try{
       if(req.user.accountType != "student"){
        return res.status(401).json({
            success:false,
            message: 'This is a protected route for Students Only',

        });
       }
       next();
    }

    catch(err){
        return res.status(401).json({
            success:false,
            message:'User role cannot be verified, Please try again',
        })

    }
}

//isInstructor

exports.isInstructor = async (req, res, next)=>{
    try{
       if(req.user.accountType != "Instructor"){
        return res.status(401).json({
            success:false,
            message: 'This is a protected route for Instructor Only',

        });
       }
       next();
    }

    catch(err){
        return res.status(401).json({
            success:false,
            message:'User role cannot be verified, Please try again',
        })

    }
}


//isAdmin

exports.isAdmin = async (req, res, next)=>{
    try{
       if(req.user.accountType != "Admin"){
        return res.status(401).json({
            success:false,
            message: 'This is a protected route for Admin Only',

        });
       }
       next();
    }

    catch(err){
        return res.status(401).json({
            success:false,
            message:'User role cannot be verified, Please try again',
        })

    }
}