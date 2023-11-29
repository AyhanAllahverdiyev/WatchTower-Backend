const express = require("express");
const nfcDataController = require("../controllers/nfc_dataController");

const router = express.Router();

router.get("/create", nfcDataController.nfc_data_create_get);
router.get("/", nfcDataController.nfc_data_index);
router.post("/", nfcDataController.nfc_data_create_post);
router.get("/:id", nfcDataController.nfc_data_details);
router.delete("/:id", nfcDataController.nfc_data_delete);
router.post("/user_history",nfcDataController.user_read_history);
router.post("/reset_read",nfcDataController.resetRead);
module.exports = router;
