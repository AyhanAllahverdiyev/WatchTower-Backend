const express = require("express");
const authController = require("../controllers/auth_controllers");
const router = express.Router();

router.get("/", authController.signup_get);
router.post("/post", authController.signup_post);
router.get("/login", authController.login_get);
router.post("/login", authController.login_post);

module.exports = router;
