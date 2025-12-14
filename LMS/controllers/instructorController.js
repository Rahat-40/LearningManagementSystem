const Course = require("../models/Course");
const User = require("../models/User");
const axios = require("axios");
const multer = require("multer"); 
const path = require("path");

// Organization Account
const LMS_ACCOUNT = "LMS201243";
const LMS_SECRET = "111111";
const UPLOAD_BOUNTY = 500;

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const uploadMiddleware = multer({ storage: storage }).fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
    { name: 'audioFile', maxCount: 1 }
]);

exports.dashboard = async (req ,res) =>{
    const courses = await Course.find({instructorId: req.user.id});
    res.render("instructor/dashboard",{courses});
};

exports.getUpload = (req , res) => res.render("instructor/upload");


// --- UPLOAD FUNCTION (Remains the same) ---
exports.upload = (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        if (err) {
            console.error("Multer Error:", err);
            return res.send("File Upload Error: " + err.message);
        }

        const { title, description, price, text,mcqJson } = req.body;

        let mcqData = [];
        if(mcqJson){
            try{
                mcqData = JSON.parse(mcqJson);
            } catch(e){
                console.err("MCQ json parse error",e)
            }
        }
        
        const videoPath = req.files['videoFile'] ? `/uploads/${req.files['videoFile'][0].filename}` : '';
        const pdfPath = req.files['pdfFile'] ? `/uploads/${req.files['pdfFile'][0].filename}` : '';
        const audioPath = req.files['audioFile'] ? `/uploads/${req.files['audioFile'][0].filename}` : '';
        
        try {
            await Course.create({
                instructorId: req.user.id,
                title, description, price,
                materials: { 
                    text, 
                    video: videoPath, 
                    pdf: pdfPath,      
                    audio: audioPath, 
                    mcq: mcqData 
                }
            });

            // 2. Process Instructor Payment (LMS pays for the upload)
            const instructor = await User.findById(req.user.id);

            // Transaction: LMS account (LMS201243) debits, Instructor account deposits
            const transactionResult = await axios.post("http://localhost:5001/bank/transfer", {
                fromAccountNumber: LMS_ACCOUNT,
                fromSecret: LMS_SECRET,
                toAccountNumber: instructor.bankAccount.accountNumber,
                amount: UPLOAD_BOUNTY
            });
            
            if(!transactionResult.data.success) {
                 // Log error but proceed, as the course was created.
                 console.error("LMS failed to pay upload bounty:", transactionResult.data.message);
            }
            req.flash("success", "Course published! You earned a 500 Tk upload bonus.");
            res.redirect("/instructor/dashboard");
        } catch (dbErr) {
            req.flash("error", "Failed to upload course. Check your file sizes.");
            res.redirect("/instructor/upload");
        }
    });
};

// --- Instructor Bank Balance Check 
exports.getBankBalance = async (req ,res) =>{
    try{
        const user = await User.findById(req.user.id);
        const account = user.bankAccount.accountNumber;
        const response = await axios.get(`http://localhost:5001/bank/balance/${account}`);
        res.render("instructor/balance",{
            balance: response.data.balance,
            accountNumber: account
        });
    } catch(err){
        console.error("Balance Check error:",err.response?.data?.message || err.message);
        res.send("Error fetching bank balance. Ensure Bank API is running.");
    }
};

//LMS Organization Bank Balance Check
exports.getLMSBankBalance = async (req ,res) =>{
    try{
        const response = await axios.get(`http://localhost:5001/bank/balance/${LMS_ACCOUNT}`);
        res.render("lms/balance-view",{
            balance: response.data.balance,
            accountNumber: LMS_ACCOUNT,
            role: req.user.role 
        });
    } catch(err){
        console.error("LMS Balance Check error:",err.response?.data?.message || err.message);
        res.send("Error fetching LMS bank balance. Ensure Bank API is running.");
    }
};