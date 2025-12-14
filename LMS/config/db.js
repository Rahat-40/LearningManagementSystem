const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/lms_db");
        console.log("LMS db is connected");
    } catch (err) {
        console.log("MongoDB connection Error: ", err);
        process.exit(1);
    }
};

module.exports = connectDB;
