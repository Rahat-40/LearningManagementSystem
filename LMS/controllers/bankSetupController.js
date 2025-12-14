const User = require("../models/User");

//render form for user to setup bank info
exports.getBankSetup = async (req ,res) => {
    const user = await User.findById(req.user.id);
    if(user.bankAccount && user.bankAccount.accountNumber) {
        return res.redirect(`/${user.role}/dashboard`); 
    }
    res.render("auth/bank-setup");
};

//handle the post request to save bank details
exports.postBankSetup = async (req ,res) =>{
    const {accountNumber,secret} = req.body;
    try{
        const user = await User.findByIdAndUpdate(req.user.id,{
            $set:{
                bankAccount:{
                    accountNumber,
                    secret
                }
            }
        }, { new: true }); 

        res.redirect(`/${user.role}/dashboard`) 
    } catch(err){
        console.error(err);
        res.send("Error updating bank information");
    }
};

exports.checkBankSetup = async (req ,res , next) => {
    try{
        const user = await User.findById(req.user.id);

        if(!user.bankAccount || !user.bankAccount.accountNumber){
            req.user.role = user.role; 
            return res.redirect("/setup-bank")
        }
        next();
    } catch(err){
        console.error(err);
        res.status(500).send("Error checking bank status");
    }
};