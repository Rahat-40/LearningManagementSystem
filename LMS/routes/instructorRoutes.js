const router = require("express").Router();
const instructorController = require("../controllers/instructorController");
const bankSetupController = require("../controllers/bankSetupController");
const auth = require("../middlewares/auth");

// The upload controller now handles Multer internally.
router.post("/upload", auth , bankSetupController.checkBankSetup , instructorController.upload); 

// ... (other routes remain the same)
router.get("/dashboard", auth, bankSetupController.checkBankSetup , instructorController.dashboard);
router.get("/upload", auth, bankSetupController.checkBankSetup , instructorController.getUpload);
router.get("/balance", auth , bankSetupController.checkBankSetup , instructorController.getBankBalance);

//LMS Organization Balance Check (accessible via Instructor routes for viewing revenue)
router.get("/lms-balance", auth , instructorController.getLMSBankBalance); 

module.exports = router;