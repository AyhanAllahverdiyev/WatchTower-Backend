const fs = require("fs");
const { response } = require("express");
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

const data = JSON.parse(fs.readFileSync("./order.json"));

// Extract the allowedOrderArray from the data
const allowedOrderArray = data.allowedOrderArray || [];
console.log(allowedOrderArray);
let currentIndex = 0;

const reset_order = (req, res) => {
  try{
  currentIndex = 0;
   res.status(200).send(
          "Read Order Reseted"
        );
   }catch(err){
    console.log(err);
    res.status(500).send('Unable to reset read order')
  }
 };
const nfc_data_create_post = (req, res) => {
  console.log("nfc_data_create_post");

  const requestedId = req.body.ID;

  if (requestedId === allowedOrderArray[currentIndex]) {
    currentIndex = (currentIndex + 1) % allowedOrderArray.length;
    const nfc_data = new NFCData(req.body);
    nfc_data
      .save()
      .then((result) => {
        res
        .status(200)
        .send(
          "SavedToDB:TRUE"
        ); 
         console.log("Successfully saved to Database");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log(
      `Expected ID: ${allowedOrderArray[currentIndex]}, Received ID: ${requestedId}`
    );
    res
      .status(400)
      .send(
        `Please read ${allowedOrderArray[currentIndex]}  instead of  ${requestedId}`
      );
  }
};

const nfc_data_delete = (req, res) => {
  const id = req.params.id;
  //delete everything in the database
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
  reset_order,
};
