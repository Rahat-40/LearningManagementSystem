const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email:{type: String ,unique: true},
    password:String,
    role: {type: String, enum:["Learner","Instructor"],default:"Learner"},
    bankAccount:{
        accountNumber:String,
        secret:String
    }

});

module.exports = mongoose.model("User",UserSchema);