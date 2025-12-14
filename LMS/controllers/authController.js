const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getLogin = (req, res) => res.render("auth/login");
exports.getRegister = (req, res) => res.render("auth/register");

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "An account with this email already exists.");
            return res.redirect("/register");
        }

        const hashpass = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashpass, role });
        
        req.flash("success", "Registration successful! Please log in.");
        res.redirect("/login");
    } catch (err) {
        req.flash("error", "Registration error: " + err.message);
        res.redirect("/register");
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "No user found with that email.");
            return res.redirect("/login");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.flash("error", "Incorrect password. Please try again.");
            return res.redirect("/login");
        }

        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || "secret");
        res.cookie("token", token, { httpOnly: true });

        req.flash("success", `Welcome back, ${user.name}!`);
        return res.redirect(user.role === 'Instructor' ? "/instructor/dashboard" : "/");
    } catch (err) {
        req.flash("error", "Login failed. Please contact support.");
        res.redirect("/login");
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    req.flash("success", "You have been logged out.");
    res.redirect("/");
};