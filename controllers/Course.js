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
        
     //Too: verify that userId and instructor details._id are same or different ?

        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:'Instruto Details not Found', 
            })
        }

        //check given tag is valid or not
        const tagDetails = await Tag.findById(tag);
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
            whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,

        })

        //add the new course to the user schema to instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new:true},
        );
        //update the TAG ks schema
        //TTOO:hw

        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create course',
            error: error.message,
        })

    }
}


//get All Courses handler function

exports.showAllCourses  = async (req, res)=>{
    try{
        const allCourses = await Course.find({}, {courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
        })
        .populate("instructor")
        .exec();
        return res.status(200).json({
            success:true,
            message:'Date for all courses fetched successfully',
            data: allCourses,
        })


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fatch course data',
            error:error.message,

        })
    }
}