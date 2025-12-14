const router = require("express").Router();
const authController = require("../controllers/authController");
const bankSetupController = require("../controllers/bankSetupController");
const auth = require("../middlewares/auth");

router.get("/login",authController.getLogin);
router.get("/register",authController.getRegister);
router.post("/register",authController.register);
router.post("/login",authController.login);
router.get("/logout",authController.logout)

//bank setup
router.get("/setup-bank" ,auth, bankSetupController.getBankSetup);
router.post("/setup-bank" ,auth, bankSetupController.postBankSetup);

module.exports = router;