const router = require("express").Router();
const courseController = require("../controllers/courseController");
const auth = require("../middlewares/auth");

router.get("/list", auth, courseController.list);
router.get("/:id",courseController.get);
router.delete("/:id", auth , courseController.delete);

module.exports = router;