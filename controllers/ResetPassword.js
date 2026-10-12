const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");



//reset PasswordToken

exports.resetPasswordToken = async (req, res) => {
try{

    
    //get email from request body
    const email = req.body.email;

    //check user for this email, email validation
    const user = await User.findOne ({email:email});
    if(!user){
        return res.json({
            success:false,
            message:'Your Email is not registered with us'
        })
    }
    // Generate token
    const token = crypto.randomUUID();

    //update user by adding token and expiretion time
    const updatedDetails = await User.findOneAndUpdate(
        {email:email},
        {
            token:token,
            resetPasswordExpires: Date.now() +5*60*1000,

        },
    {new:true});

    //create URl
    const url = `http://localhost:3000/update-password/${token}`
    //send mail containing the URL
    await mailSender(email, "Password Reset Link",
              `Passeord Reset Link:${url}`
    );
    //Retrun response
    return res.json({
        success:true,
        message: 'Email sent successfully, Please check email and change pwd'
    })


}

catch(error){
    consloe.log(error);
    return res.status(500).json({
        success:false,
        message:'Something went wrong while sending reset pwd mail'
    })

}

}



//resetPassword
exports.resetPassword = async (req, res) =>{
   try{
     //data fetch
     const {password, confirmPassword, token} = req.body;
    //validation
    if(password !== confirmPassword ){
        return res.status.json({
            success:false,
            message:"Password are Mismatch",
        });
    }
    //get userdetails from db using token
    const userDetails = await User.findOne({token: token});
    //if not entry -> invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:'Token is invaild',
        });

    }
    //token time
    if(userDetails.resetPasswordExpires < Date.now() ) {
        return res.json({
            success:false,
            message:'Token is expired, Please regenerate ypur token',
        })

    }
    //hash password 
    const hashedPassword = await bcrypt.hash(password, 10);

    //update password
    await User.findOneAndUpdate(
        {token:token},
        {password: hashedPassword},
        {new:true},
    );
    // return responce
    return res.status(200).json({
        success:true,
        message:'Password Rest Successfully'
    })
   }

   catch(error)
   {
    console.log(error);
    return res.status(500).json({
        success:false,
        Message:'Something went wrong while sending reset pwd mail'
    })

   }

}