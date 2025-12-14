const mongoose = require("mongoose");

const LearnerCourseSchema = new mongoose.Schema({
    learnerId: {type:mongoose.Schema.Types.ObjectId, ref:"User"},
    courseId: {type: mongoose.Schema.Types.ObjectId,ref:"Course"},
    completionStatus: {type:String ,default:"PENDING"},
    quizScore: {type: Number, default: 0},
    certificateIssued: {type: Boolean, default:false},
    createdAt: {type: Date, default:Date.now}
});

module.exports = mongoose.model("LearnerCourse",LearnerCourseSchema);