const express=require("express");
const tagOrderController=require("../controllers/tagOrder_Controllers");
const router=express.Router();
router.post("/new",tagOrderController.tagOrder_Post);
router.get("/get",tagOrderController.tagOrder_Get);
   module.exports=router;