const Tag = require("../models/tags");

//create Tage ka handler funcation

exports.createTag = async (req, res) =>{
    try{
        const {name, description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }
        //Create entry in DB
        const tagDetails = await Tag.create({
            name:name,
            descritption:description,
        });
        console.log(tagDetails);
        //return responce
        return res.status(200).json({
            success:false,
            message:'Tag Created Successfull',
        })

    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//get all tags handler function


exports.showAlltags = async (req, res) =>{
    try{
        const alTags = await Tag.find({}, {name:true, description:true});
        res.status(200).json({
            success:true,
            message:"All Tag return successfully",
            allTags,
        })
    }

    catch(error){
        return res.status(500).json({
            success: false,
            message:error.message,
        })
    }
}
