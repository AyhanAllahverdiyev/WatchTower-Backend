// File: controllers/nfc_dataController.js
const NFCData = require("../models/nfc_data");

const nfc_data_index = (req, res) => {
  NFCData.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { logs: result, title: "All NFC Data" });
    })
    .catch((err) => {
      console.log(err);
    });
};

const nfc_data_details = (req, res) => {
  const id = req.params.id;
  NFCData.findById(id)
    .then((result) => {
      res.render("details", { nfc_data: result, title: "NFC Data Details" });
    })
    .catch((err) => {
      res.status(404).render("404", { title: "NFC Data not found" });
    });
};

const nfc_data_create_get = (req, res) => {
  res.render("create", { title: "Create a new NFC Data" });
};

const nfc_data_create_post = (req, res) => {
  const nfc_data = new NFCData(req.body);
  nfc_data
    .save()
    .then((result) => {
      res.redirect("/logs");
    })
    .catch((err) => {
      console.log(err);
    });
};

const nfc_data_delete = (req, res) => {
  const id = req.params.id;
  NFCData.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/logs" });
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  nfc_data_index,
  nfc_data_details,
  nfc_data_create_get,
  nfc_data_create_post,
  nfc_data_delete,
};
