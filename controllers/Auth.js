const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


//send OTP
exports.sendOTP = async(req, res)=>{
  try{
      const {email} = req.body;// fetch email from request ki body
    //cheak if user already exist

    const checkUserPresent = await User.findOne({email});

    //if user already exist, them return a response

    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:'User already exists',

        })
    }


    //Generate otp
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });

    console.log("OTP generated:", otp);

    // Check Uniqe OTP or Not?
    let result = await OTP.findOne({otp: otp});

    while(result){
        otp = otpGenerator(6,{
         upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,

        });
        result = await OTP.findOne({otp: otp});
    }

     const otpPayload = {email, otp};

     //create an entery for OTP
     const otpBody = await OTP.create(otpPayload);
     console.log(otpBody);

     //return response successful
     res.status(200).json({
        success:true,
        message:'OTP Send Successfully.',
        otp,
     })



  }
  catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:error.message,
    })

  }

};





//SignUp
exports.signUp = async (req, res)=>{

    try{

        //data fetch from request ki body
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    } =req.body;
    //data validation
    if(!firstName || !lastName || !email || !password || !confirmPassword  || !otp){
        return res.status(403).json({
            success:false,
            message:"All fields are required",
        })
    }
    // comparision Two password
    if(password !== confirmPassword){
        return res.status(400).json({
            success:true,
            message:'Password and ConfirmPassword Value does not match, pleade try again',
        });
    }
    // check user already exit or NOt
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
        success:false,
        message:'User is already Registered',

        })
       
    }
    //finde most recent OTp stored for the user
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log(recentOtp)
    // validate OTP

    if(recentOtp.length == 0){
        //OTP not found
        return res.status(400).json({
            success:false,
            message:'OTP Found'
        })
    } else if(otp !== recentOtp.otp){
        //invalid Otp
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        });
    }
    

    //Hash Password
    const hashedPassword = await bcrypt.hash(password,10);

    //entry creat in Db

    const ProfileDetails = await Profiler.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    })




    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:ProfileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`
    })

    //return res
    return res.status(200).json({
        success:true,
        message:'User is registered Successfully',
        user,
    });

    }
    catch(error){
        console.log(error);
       return res.status(500).json({
            success:false,
            message:"User cannot be registrered. Please try again",
        })

    }


}



//Login

exports.login = async (req, res) =>{
    try{
        //get data form req body
        const {email, password} = req.body;

        //validation
        if(!email || !password){
            return res.status(403). json({
            success:false,
            message:'All field are required, Please try again',
            });
           
        }
        //User check exist or not
        const user = await User.fondOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not exists, Please signup furst",
            });
        }
        //generat JWT, after password natching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                role:user.role,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"2h",
            })
            user.token = token;
            user.password = undefined;

        }
        //Create cookie and response
        const options ={
            expires: new Date(Date.now()+3*24*60*60*1000),
            httpOnly: true,
        }
        res.cookie("token", token, options).status(200).json({

            success:true,
            token,
            user,
            message:"Logged in successfully",

        })
    }
        else {
            return
        }
    


    }
    catch(error){
        
    }


};



