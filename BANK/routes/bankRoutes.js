const router = require("express").Router();
const bankController = require("../controllers/bankController");

// route for bank initial setup
router.post("/create",bankController.createAccount);

// App routes used by lms 
router.get("/balance/:acc",bankController.checkBalance);
router.post("/transaction",bankController.handleTransaction);
router.post("/deposit",bankController.handleDeposit);
router.post("/transfer", bankController.handleTransfer);

module.exports = router;