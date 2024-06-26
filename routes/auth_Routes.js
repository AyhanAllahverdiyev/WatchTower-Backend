const express = require("express");
const authController = require("../controllers/auth_Controllers");
const nfcDataController = require("../controllers/nfc_dataController");
const router = express.Router();

router.get("/signup", authController.signup_get);
router.post("/signup", authController.signup_post);
router.get("/login", authController.login_get);
router.post("/login", authController.login_post);
router.post("/logout", authController.logout);
router.post("/jwt-verify", authController.jwt_verify);
router.get('/get_all_users',authController.get_All_Users);
router.post('/change_auth_level',authController.change_auth_level);
router.post("/user_delete", authController.delete_user);
////////////////
router.post('/login_web', authController.login_post_web)
module.exports = router;


 