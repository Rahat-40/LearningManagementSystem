const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken"); 
const connectDB = require("./config/db");

// --- Import Routes ---
const authRoutes = require("./routes/authRoutes");
const learnerRoutes = require("./routes/learnerRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const courseRoutes = require("./routes/courseRoutes");

require("dotenv").config();
const Course = require("./models/Course"); // Model dependency
const app = express();
const PORT = 5000;

// Call DB connection (assuming this function is defined elsewhere)
connectDB();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "lms-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 } 
}));
app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
// --- Global Authentication Middleware (Sets res.locals.user) ---
app.use((req, res, next) => {
         res.locals.path = req.path || "/";
         res.locals.success = req.flash("success");
         res.locals.error = req.flash("error");
    try {
        const token = req.cookies.token;
        
        if (token) {
            
            res.locals.user = jwt.verify(token, process.env.JWT_SECRET || "secret");
        } else {
            res.locals.user = null;
        }
    } catch (e) {
        res.clearCookie("token");
        res.locals.user = null;
    }
    next();
});

// --- Route Mounting ---
app.use("/", authRoutes);
app.use("/learner", learnerRoutes);
app.use("/instructor", instructorRoutes);
app.use("/course", courseRoutes);

// --- Public Home Page Route ---
app.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        // Renders the public home page view, accessible to all
        res.render("index", { courses: courses });
    } catch (err) {
        console.error(err);
        res.send("Error loading home page");
    }
});

app.listen(PORT, () => {
    console.log(`LMS running on http://localhost:${PORT}`);
});