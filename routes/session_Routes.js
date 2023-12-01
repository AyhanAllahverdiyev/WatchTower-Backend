const express=require("express");
const router=express.Router();
const sessionController=require("../controllers/session_Controller");
 router.post("/check",sessionController.session_Check);
router.post("/create",sessionController.session_Create);
// router.post("/updateIsRead",sessionController.session_Update);

module.exports=router;