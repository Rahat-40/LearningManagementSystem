const router = require("express").Router();
const learnerController = require("../controllers/learnerController");
const bankSetupController = require("../controllers/bankSetupController");
const auth = require("../middlewares/auth");

// check bank setup before accessing 
router.get("/dashboard",auth, bankSetupController.checkBankSetup, learnerController.deshboard);
router.post("/buy/:id", auth, bankSetupController.checkBankSetup, learnerController.buyCourse);

router.get("/my-course",auth , learnerController.myCourses);
router.get("/course/:id", auth , learnerController.viewCourse);

router.post("/course/:id/quiz",auth , learnerController.submitQuiz);
router.post("/course/:id/complete", auth , learnerController.completeCourse);
router.post("/course/:id/retake", auth, learnerController.retakeQuiz);
router.get("/course/:id/certificate", auth , learnerController.certificates);

//  Learner Bank Balance Check
router.get("/balance", auth , bankSetupController.checkBankSetup , learnerController.getBankBalance);

router.get("/purchase-success/:id", auth, learnerController.purchaseSuccess);

module.exports = router;