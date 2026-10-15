
const Section = require("../models/Section");
const Course = require("../models/Course");


exports.createSection = async (req, res)=>{
    try{
        //data fetch
        const {sectionName, courseId} = req.body;

        //Data Validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }
        //create section
        const  newSection = await Section.create({sectionName});
        //update course with section objectId
        const updatedCoursDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
             {new:true},

        );
        //hw:usepopulate to replace section/sub-section both in the updated details

        // return responce
        return res.status(200).json({
            sucess:true,
            message:'Section Created successfully',
            updatedCoursDetails,
        })

    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create section please try again",
            error:error.message,
        })

    }
}

exports.updateSection = async (req, res) =>{
    try{
        //data fetch
        const {sectionName, sectionId} = req.body;

        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }
        
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});



        //return response
        return res.status(200).json({
            success:true,
            message:'Section Updated Successfully',
        });


    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update Section, Please try again",
            error: error.message,
        });
    }
}

exports.deleteSection = async (req, res) =>{
    try{
        //get id- assuming taht we are sending id in params
        const {sectionId} = req.params
        //use findByIdAndDelete

        //TODO: do we need to delete the entry frome the course schema
        await Section.findByIdAndUpdate(sectionId);

        //res data
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",

        })

    }

    catch(error){
         return res.status(500).json({
            success:false,
            message:"Unable to Delete Section, Please try again",
            error: error.message,
        });
    }
}