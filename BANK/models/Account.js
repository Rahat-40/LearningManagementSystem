const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
    accountNumber: {type: String,required: true,unique:true},
    secret: {type: String, required: true},
    balance: {type : Number, default: 0}
});

module.exports = mongoose.model("Account",AccountSchema);