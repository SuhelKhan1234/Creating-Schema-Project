const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUpoder");

//creatCourese handler function

exports.createCourse = async (req, res) => {
    try{

        //fetch data 
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        //get thumbaill
        const thumbnail = req.files.thumbnailImage;

        //Validation

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message:'All fields are required',
            });
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);

        console.log("Instructor Details:", instructorDetails);

        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:'Instruto Details not Found', 
            })
        }

        //check given tag is valid or not
        const tagDetails = await Tag.findById{tag};
        if(!tagDetails){
            return res.status(404).json({
            success:false,
            message:'Tag Details Not found',

            });
        }

        //Upload Image top Cloudinary
        const thumbnailImage = await  uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            
        })



        

    }
    catch(error){

    }
}
