const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    title:String,
    description:String,
    price:Number,
    instructorId:{ type: mongoose.Schema.Types.ObjectId, ref:"User"},
    materials:{
        text:String,
        video:String,
        pdf:String,
        audio:String,
        mcq: [{
            question:String,
            options: [String],
            correctAnswer: String
        }]
    },
    createdAt:{type:Date, default:Date.now}
});

module.exports = mongoose.model("Course",CourseSchema);