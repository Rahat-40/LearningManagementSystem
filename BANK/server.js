const express = require("express");
const path = require("path");
const cors = require("cors");
const connectBankDB = require("./config/db");
const bankRoutes = require("./routes/bankRoutes");

const app = express();

connectBankDB();

app.use(cors()); // Allows LMS (Port 5000) to communicate
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Bank Home / Portal
app.get("/", (req, res) => {
    res.render("bank-portal");
});

app.use("/bank", bankRoutes);

app.listen(5001, () => console.log("🏦 Bank System live on http://localhost:5001"));