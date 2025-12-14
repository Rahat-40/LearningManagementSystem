const Course = require("../models/Course");
const LearnerCourse = require("../models/LearnerCourse");
const User = require("../models/User");
const axios = require("axios");

// Organization
const LMS_ACCOUNT = "LMS201243";
const COMMISSION_RATE = 0.8;

// dashboard
exports.deshboard = async(req , res) => {
    try {
        const courses = await Course.find();
        res.render("learner/dashboard", { courses });
    } catch (err) {
        req.flash("error", "Error loading dashboard.");
        res.redirect("/");
    }
};
// full transaction 
exports.buyCourse = async(req ,res) =>{
    try{
        const learner = await User.findById(req.user.id);
        const course = await Course.findById(req.params.id);
        
        if(!learner || !course) {
            req.flash("error", "Course or User not found.");
            return res.redirect("/");
        }

        const existingEnrollment = await LearnerCourse.findOne({
            learnerId: req.user.id, 
            courseId: req.params.id
        });
        
        if (existingEnrollment) {
            req.flash("success", "You are already enrolled in this course.");
            return res.redirect(`/learner/course/${course._id}`); 
        }

        // Bank Transaction
        const debitResult = await axios.post("http://localhost:5001/bank/transaction",{
            accountNumber:learner.bankAccount.accountNumber,
            secret: learner.bankAccount.secret,
            amount: course.price
        });

        if(!debitResult.data.success) {
            req.flash("error", "Payment failed: Insufficient balance or invalid credentials.");
            return res.redirect(`/course/${course._id}`);
        }

        // Commissions & Enrollment
        await axios.post("http://localhost:5001/bank/deposit",{
            accountNumber: LMS_ACCOUNT,
            amount: course.price * (1 - COMMISSION_RATE)
        });

        const instructor = await User.findById(course.instructorId);
        await axios.post("http://localhost:5001/bank/deposit",{
            accountNumber: instructor.bankAccount.accountNumber,
            amount: course.price * COMMISSION_RATE
        });

        await LearnerCourse.create({
            learnerId:req.user.id, 
            courseId: course._id  
        });

        req.flash("success", "Enrollment successful! Happy learning.");
        res.redirect(`/learner/purchase-success/${course._id}`); 
    } catch(err){
        req.flash("error", "Payment error: Bank API is unreachable.");
        res.redirect(`/course/${req.params.id}`);
    }
};

exports.myCourses = async(req , res) => {
    const my = await LearnerCourse.find({learnerId:req.user.id});
    const courses = [];
    for (let m of my){
        const course = await Course.findById(m.courseId);
        if(course) courses.push(course);
    }
    res.render("learner/my-courses",{courses});
};

// View Course (Materials)
exports.viewCourse = async (req, res) => {
    try {
        const learnerCourse = await LearnerCourse.findOne({learnerId: req.user.id, courseId: req.params.id});
        
        if(!learnerCourse) {
            req.flash("error", "You must buy this course to access the materials.");
            return res.redirect(`/course/${req.params.id}`);
        }
        
        const course = await Course.findById(req.params.id);
        res.render("learner/materials", { course, learnerCourse }); 
    } catch (err) {
        req.flash("error", "Error loading course content.");
        res.redirect("/learner/my-course");
    }
};

// Quiz Submission
exports.submitQuiz = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        const learnerCourse = await LearnerCourse.findOne({learnerId: req.user.id, courseId: req.params.id});
        
        const mcqs = course.materials.mcq || [];
        let score = 0;

        mcqs.forEach((q, index) => {
            if (req.body[`question_${index}`] === q.correctAnswer) score++;
        });

        const percentage = Math.round((score / mcqs.length) * 100);

        if (percentage >= 50) {
            learnerCourse.completionStatus = "COMPLETED";
            learnerCourse.quizScore = percentage;
            await learnerCourse.save();
            req.flash("success", `Congratulations! You passed with ${percentage}%`);
            res.redirect(`/learner/course/${req.params.id}`);
        } else {
            req.flash("error", `Quiz Failed (${percentage}%). You need 50% to pass. Please try again.`);
            res.redirect(`/learner/course/${req.params.id}`);
        }
    } catch (err) {
        req.flash("error", "An error occurred while submitting the quiz.");
        res.redirect(`/learner/course/${req.params.id}`);
    }
};


exports.completeCourse = async (req, res) => {
    try {
        await LearnerCourse.updateOne(
            { learnerId: req.user.id, courseId: req.params.id },
            { completionStatus: "COMPLETED" }
        );
        req.flash("success", "Course marked as completed!");
        res.redirect(`/learner/course/${req.params.id}`);
    } catch (err) {
        req.flash("error", "Error completing course.");
        res.redirect(`/learner/course/${req.params.id}`);
    }
};
// ---  Retake Quiz Function ---
exports.retakeQuiz = async (req, res) => {
    try {
        const learnerCourse = await LearnerCourse.findOne({learnerId: req.user.id, courseId: req.params.id});
        
        if (!learnerCourse) {
            return res.status(404).send("Enrollment not found.");
        }
        
        // Reset the status and score to allow a clean retake
        learnerCourse.completionStatus = "PENDING";
        learnerCourse.quizScore = 0; 
        await learnerCourse.save();

        res.redirect(`/learner/course/${req.params.id}`);

    } catch (err) {
        console.error("Retake quiz error:", err);
        res.status(500).send("Error initiating quiz retake.");
    }
};

exports.certificates = async (req, res) => {
    const progress = await LearnerCourse.findOne({learnerId: req.user.id, courseId: req.params.id});
    if(!progress || progress.completionStatus != "COMPLETED") return res.send("Complete course first.");

    const user = await User.findById(req.user.id);
    const course = await Course.findById(req.params.id);

    res.render("learner/certificate", {
        user, 
        course, 
        score: progress.quizScore, 
        id: "CERT-"+ Date.now()
    });
};

//  Learner Bank Balance Controller
exports.getBankBalance = async (req ,res) =>{
    try{
        const user = await User.findById(req.user.id);
        const account = user.bankAccount.accountNumber;
        const response = await axios.get(`http://localhost:5001/bank/balance/${account}`);
        res.render("learner/balance",{
            balance: response.data.balance,
            accountNumber: account
        });
    } catch(err){
        console.error("Balance Check error:",err.response?.data?.message || err.message);
        res.send("Error fetching bank balance. Ensure Bank API is running.");
    }
};

exports.purchaseSuccess = async (req, res) => {
    try {
        // Fetch the course and enrollment record to verify status
        const course = await Course.findById(req.params.id);
        const learnerCourse = await LearnerCourse.findOne({learnerId: req.user.id, courseId: req.params.id});

        if (!course || !learnerCourse) {
            return res.status(404).send("Course or Enrollment not found.");
        }

        // Renders the dedicated success page
        res.render("learner/purchase-success", { course });

    } catch (err) {
        console.error("Purchase success view error:", err);
        res.status(500).send("Error loading success page.");
    }
};