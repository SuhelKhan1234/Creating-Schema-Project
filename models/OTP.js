const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender")
const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,   
    },

    otp:{
        type:String,
        required:true,

    },

    createdAt:{
        type:Date,
        default:Date,
        expires:5*60,
    }
});

// a function -> to send mail

async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email,"Varification Email From StudyNotion", otp);
       console.log("Email sent Successfully:", mailResponse);

    }
    catch(error){
        console.log("Error occured while sending mails:", error);
        throw error;
    }
}


OTPSchema.pre('save', async function(Next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})





module.exports = mongoose.model("OTP", OTPSchema);