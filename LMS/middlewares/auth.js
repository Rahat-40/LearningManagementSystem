const jwt = require("jsonwebtoken");

module.exports = (req , res ,next) =>{
    try{
        const token = req.cookies.token;
        if(!token) return res.redirect("/login");

        req.user = jwt.verify(token,process.env.JWT_SECRET || "secret");
        next();
    } catch(err){
        res.clearCookie("token");
        return res.redirect("/login");
    }
};