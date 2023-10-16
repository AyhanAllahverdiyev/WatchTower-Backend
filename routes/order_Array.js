const express = require("express");
const orderController = require("../controllers/order_ArrayControllers");
const router = express.Router();

router.get("/", orderController.order_array_get);
router.post("/", orderController.order_array_post);

module.exports = router;
