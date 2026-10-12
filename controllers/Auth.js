const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");


//send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body; // fetch email from request ki body
    // check if user already exist

    const checkUserPresent = await User.findOne({ email });

    //if user already exist, then return a response

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }


    //Generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP generated:", otp);

    // Check Unique OTP or Not?
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //create an entry for OTP
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response successful
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully.",
      otp,
    });


  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




//SignUp
exports.signUp = async (req, res) => {

  try {

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
    } = req.body;

    //data validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // comparison Two password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: true,
        message: "Password and ConfirmPassword Value does not match, please try again",
      });
    }

    // check user already exist or not
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already Registered",
      });
    }

    //find most recent OTP stored for the user
    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(recentOtp);

    // validate OTP

    if (recentOtp.length == 0) {
      //OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP Found"
      });
    } else if (otp !== recentOtp[0].otp) {
      //invalid Otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }


    //Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    //entry create in Db

    const ProfileDetails = await Profiler.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });


    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: ProfileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    });

    //return res
    return res.status(200).json({
      success: true,
      message: "User is registered Successfully",
      user,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again",
    });
  }
};



//Login

exports.login = async (req, res) => {
  try {
    //get data from req body
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required, Please try again",
      });
    }

    //User check exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not exists, Please signup first",
      });
    }

    //generate JWT, after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.token = token;
      user.password = undefined;

      //Create cookie and response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({

        success: true,
        token,
        user,
        message: "Logged in successfully",

      });
    } else {
      return res.status(401).json({
        success:false,
        message:'Password is incorrect',

      });
    }


  } catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:'Login Faulure, Please try again',
    });

  }
};

// //chnage Password
// exports.changePassword = async (req, res) =>{
//   //get data from req body
//   //get oldPassword, newPassword, confirmNewPassword
//   //Validation

//   //Update pwd in DB
//   //send mail - Password updated
//  //return responce
// }


//Change Password
exports.changePassword = async (req, res) => {
    try {
        //get data from req body
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        //get oldPassword, newPassword, confirmNewPassword

        //Validation
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm new password do not match",
            });
        }

        //Get user details
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        //Check old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        //Update pwd in DB
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        //send mail - Password updated
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: user.email,
            subject: "Password Updated Successfully",
            html: `
                <h2>Password Updated</h2>
                <p>Hello ${user.firstName},</p>
                <p>Your account password has been updated successfully.</p>
                <p>If you did not make this change, please contact support.</p>
            `,
        });

        //return response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Unable to update password. Please try again",
        });
    }
};