const Course = require("../models/Course")
const User = require("../models/User")
const LearnerCourse = require("../models/LearnerCourse")

// list of all course
exports.list = async ( req ,res) => {
    try{
        const courses = await Course.find();
        res.json(courses);
    } catch(err){
        res.status(500).json({message: "Error listing courses."});
    }
};


// File: controllers/courseController.js

exports.get = async (req ,res) => {
    try{
        const course = await Course.findById(req.params.id);
        if(!course) return res.status(404).json({message: "Course not found"});
        
        let isEnrolled = false;
        
        // ⭐ CORE FIX: Get the user from res.locals, which is set by the global middleware
        const user = res.locals.user;
        
        // --- DEBUGGING START ---
        console.log("--- Course Detail Load ---");
        console.log("Logged-in User:", user ? { id: user.id, role: user.role } : 'NOT LOGGED IN');
        console.log("Course ID:", req.params.id);
        // --- DEBUGGING END ---

        // 1. Check if a user is logged in AND is a Learner
        if (user && user.role === 'Learner') {
            
            // 2. Query the LearnerCourse collection for an existing enrollment
            const enrollment = await LearnerCourse.findOne({
                // Use the user ID from the res.locals object
                learnerId: user.id, 
                courseId: req.params.id
            });
            
            // 3. Set the flag: true if enrollment exists, false otherwise
            isEnrolled = !!enrollment;
            
            // --- DEBUGGING START ---
            console.log("Enrollment Found:", isEnrolled);
            // --- DEBUGGING END ---
        }
        
        // 4. Render the view, passing the 'user' object retrieved from res.locals
        res.render("course/detail", {
            course,
            user: user, // Pass the user object for template logic
            isEnrolled: isEnrolled 
        });
        
    } catch(err){
        console.error("Error fetching course details:", err);
        res.status(500).send("Error fetching course details.");
    }
};

// function for delete a course
exports.delete = async( req , res) => {
    try{
        const result = await Course.findByIdAndDelete(req.params.id);
        if(!result) return res.status(404).json({message: "Course not found"});
        res.json({message: "Course Deleted successfully"});
    } catch(err){
        res.status(500).json({message:"Error deleting course"});
    }
};