const mongoose = require("mongoose");

const connectBankDB = async () => {
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/bank_db",{
        });
        console.log("Bank db is connected");
    } catch(err){
        console.log("Bank MongoDB connection Error: ",err);
        process.exit(1);
    }
};

module.exports = connectBankDB;