const fs = require("fs");
const { response } = require("express");
const NFCData = require("../models/nfc_data");
const { json } = require("body-parser");
const { reset } = require("nodemon");
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
function updateIsReadValue(fileName, nameToUpdate, newValue) {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    let jsonContent;
    try {
      jsonContent = JSON.parse(data);
     } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return;
    }

    const itemToUpdate = jsonContent.allowedOrderArray.find(item => item.name.toString() === nameToUpdate);
    if (itemToUpdate) {
      itemToUpdate.isRead = newValue;
      console.log(allowedOrderArray);
    } else {
      console.error(`Item with name ${nameToUpdate} not found`);
      return;
    }

    const updatedData = `{\n  "allowedOrderArray": ${JSON.stringify(jsonContent.allowedOrderArray, null, 2)}\n}\n`;

    fs.writeFile(fileName, updatedData, 'utf8', err => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log('File updated successfully!');
      }
    });
  });
}

function resetIsReadValues(fileName) {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    let jsonContent;
    try {
      jsonContent = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return;
    }

    jsonContent.allowedOrderArray.forEach(item => {
      item.isRead = false;
    });

    const updatedData = `{\n  "allowedOrderArray": ${JSON.stringify(jsonContent.allowedOrderArray, null, 2)}\n}\n`;

    fs.writeFile(fileName, updatedData, 'utf8', err => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log('All isRead values reset successfully!');
      }
    });
  });
}

let allowedOrderArray = [];

   const data = fs.readFileSync("./order.txt", "utf8");
  const parsedData = JSON.parse(data);
  allowedOrderArray = parsedData.allowedOrderArray || [];
  console.log(allowedOrderArray);
 

let currentIndex = 0;
const reset_order = (req, res) => {
  try{
  currentIndex = 0;
  resetIsReadValues("./order.txt");
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

  if (requestedId === allowedOrderArray[currentIndex]?.name.toString()) {
    allowedOrderArray[currentIndex].isRead = true;

    // Check if it's the last tag in the array
    if (currentIndex === allowedOrderArray.length - 1) {
      console.log('Last tag Read, Tour Completed');
      currentIndex = 0; // Restart from the beginning
      resetIsReadValues("./order.txt");
   //   const data=fs.readSync("./order.txt");
      const newParse = JSON.parse(data);
      allowedOrderArray = newParse.allowedOrderArray || [];    }
       else {
      currentIndex = (currentIndex + 1) % allowedOrderArray.length;
    }

    console.log(allowedOrderArray);
    console.log(`currentIndex: ${currentIndex}`);
    
    const nfc_data = new NFCData(req.body);
    nfc_data
      .save()
      .then((result) => {
        console.log("Successfully saved to Database");
        updateIsReadValue("./order.txt", requestedId, true);

        // Respond after processing
        if (currentIndex === 0) {
          res.status(302).send("SavedToDB:TRUE, Tour Completed");
          resetIsReadValues("./order.txt");
        } else {
          res.status(200).send("SavedToDB:TRUE");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error saving to database");
      });
  } else {
    console.log(
      `Expected ID: ${allowedOrderArray[currentIndex]?.name}, Received ID: ${requestedId}`
    );
    res.status(400).send(
      `Please read ${allowedOrderArray[currentIndex]?.name} instead of ${requestedId}`
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
  resetIsReadValues
 };
 