const Account = require("../models/Account");

// handle account creation 

exports.createAccount = async (req , res ) => {
    try{
        let {accountNumber,secret,balance} = req.body;
        balance = Number(balance) || 0; 

        if (balance < 0) {
            return res.status(400).json({
                success: false,
                message: "Initial balance cannot be negative"
            });
        }

        const newAccount = await Account.create({accountNumber,secret,balance});
        res.status(201).json({success: true, account: newAccount});
    } catch(err){
        res.status(500).json({success:false, message: "Error creating account.", error: err.message})
    }
};

// check balance

exports.checkBalance = async (req ,res) => {
    try{
        const account = await Account.findOne({accountNumber: req.params.acc});
        if(!account) return res.status(404).json({success: false, message:"Account not found"});
        res.json({success: true, balance: account.balance});
    } catch(err){
        res.status(500).json({success:false,message:"Error fatching balance"});
    }
};

// handle debit 

exports.handleTransaction = async (req ,res) => {
    let {accountNumber,secret,amount} = req.body;

    amount = Number(amount); 

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    try{
        const account = await Account.findOne({accountNumber});
        if(!account) return res.status(404).json({success:false ,message:"Account not found."});
        if(account.secret!=secret) return res.status(401).json({success:false, message:"Invalid secret"});
        if(account.balance < amount) return res.status(400).json({success:false, message:"Insufficient balance"});
        account.balance-=amount;
        await account.save();
        res.json({success:true,message: "Debit successful."});

    } catch(err){
        res.status(500).json({success:false,message: "Transaction failed"});
    }
};

//handle deposit

exports.handleDeposit = async (req ,res) =>{
    let {accountNumber,amount} = req.body;
    amount = Number (amount);

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    try{
        const account = await Account.findOne({accountNumber});
        if(!account) return res.status(404).json({success:false, message:"Account not found."});

        account.balance+=amount;
        await account.save();
        res.json({success:true, message:"Deposit successful"});
    } catch(err){
        res.status(500).json({success:false, message:"Internal Server Error."})
    }
};

exports.handleTransfer = async (req ,res) => {
    let { fromAccountNumber, fromSecret, toAccountNumber, amount } = req.body;
    amount = Number(amount); 

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    if (fromAccountNumber === toAccountNumber) {
        return res.status(400).json({success: false, message: "Cannot transfer to the same account."});
    }

    try{
        // 1. Find and validate Sender (Debit)
        const senderAccount = await Account.findOne({accountNumber: fromAccountNumber});
        if(!senderAccount) return res.status(404).json({success:false ,message:`Sender account (${fromAccountNumber}) not found.`});
        if(senderAccount.secret !== fromSecret) return res.status(401).json({success:false, message:"Invalid secret for sender account"});
        if(senderAccount.balance < amount) return res.status(400).json({success:false, message:"Insufficient balance in sender account"});

        // 2. Find Receiver (Credit)
        const receiverAccount = await Account.findOne({accountNumber: toAccountNumber});
        if(!receiverAccount) return res.status(404).json({success:false ,message:`Receiver account (${toAccountNumber}) not found.`});

        // 3. Perform transfer (Debit then Credit)
        senderAccount.balance -= amount;
        receiverAccount.balance += amount;

        // 4. Save both accounts atomically
        await senderAccount.save();
        await receiverAccount.save();

        res.json({success:true, message: `Transfer of ${amount} successful.`});

    } catch(err){
        res.status(500).json({success:false, message: "Transfer failed due to a server error."});
    }
};