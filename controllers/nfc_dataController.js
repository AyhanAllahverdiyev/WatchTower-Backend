const fs = require("fs");
const { response } = require("express");
const NFCData = require("../models/nfc_data");
const { json } = require("body-parser");
const { reset } = require("nodemon");
const User = require("../models/User");
const { Console, count } = require("console");
const Session=require("../models/session")
const tagOrder=require("../models/tagOrder");
const { TLSSocket } = require("tls");
const { tagOrder_Get } = require("./tagOrder_Controllers");
 const WebSocket=require('ws')


const wss = new WebSocket.Server({ port: 3002 }); 

wss.on('connection', (ws) => {
  console.log('Client connected');

    ws.send(" Connection Active");
   ws.on('close', () => {
    console.log('Client disconnected');
   
  });

  
});
  




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
 





const user_read_history= async(req,res)=>{
  try{
  const id = req.body._id;
    console.log(id);
 await  NFCData.find({user_id:id})
 .then((result)=>{
  if(result.length==0 ){
    console.log("User not found");
    return res.status(404).json({message:'User not found'});
  }
  else{ 
   res.status(200).json(result);
  }
 })
}catch(err){
  res.statuscode(500).send('Unable to get user read history')
}
  
}


 

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 async function getUserSession(userId) {
  try {
    const userSession = await Session.findOne({ userId, isActive: true });

    return userSession;
  } catch (error) {
    console.error(error);
    return null;
  }
} 

async function checkTour(userId) {
  try {
    const userSession = await Session.findOne({ userId, isActive: true });

    for (const item of userSession.tagOrderIsread) {
      if (item.isRead === false) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}
 
const nfc_data_create_post = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const received_cardID = req.body.card_id;
    const received_NAME=req.body.name;
    const session_id=req.body.session_id;

    const userSession = await getUserSession(user_id);

    if (!userSession) {
      console.log("User session not found or inactive");
      return res.status(404).json({ message: "User session not found or inactive" });
    }

    console.log("ORDER ARRAY FROM SESSION:", userSession.tagOrderIsread);

    const allowedOrderArray = userSession.tagOrderIsread;

    if (allowedOrderArray.length === 0) {
      console.log("Allowed order array is empty");
      return res.status(404).json({ message: "Allowed order array is empty" });
    }
    console.log("=============================================");
        
     let expectedItemName = '';
     let expectedItemCardID='';

  
    for (const item of allowedOrderArray) {
       if (item.isRead === false) {
         
         expectedItemName = item.name;
         expectedItemCardID=item.card_id;
        break;
      }
    }
    console.log("Expected item NAME:", expectedItemName);
    console.log("Received item NAME:", received_NAME);


    if (received_cardID === expectedItemCardID) {
   
      
        await NFCData.create(req.body);

        const updatedUserSession = userSession.tagOrderIsread.map((item) => {
          if (item.card_id === expectedItemCardID) {
            return { ...item, isRead: true };
          }
          return item;
        });

        userSession.tagOrderIsread = updatedUserSession;
        await userSession.save();

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send("refresh"); // Send your desired message here
          }
        })




        if ( await checkTour(user_id)) {
          console.log("Tour completed");
          console.log("=============================================");
          const updatedUserSession = userSession.tagOrderIsread.map((item) => {
            return { ...item, isRead: false };
         });
  
        userSession.tagOrderIsread = updatedUserSession;
        await userSession.save();
       
         console.log("Tour completed");
          
          console.log("============================================= FINAL VERSION AFTER TOUR =================================");
          console.log( userSession.tagOrderIsread);
            return res.status(302).json({ message: "Tour Completed" });
         }
        else{
        res.status(200).json({ message: "Card read successfully" });
        }
   
    } else {
      console.log("Expected item ID:", expectedItemCardID);
      console.log("Received item ID:", received_cardID);
      res.status(400).json({ expectedItemNAME :expectedItemName, receivedItemNAME: received_NAME});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

  


 
 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 

module.exports = {
    user_read_history,
  nfc_data_index,
  nfc_data_details,
  nfc_data_create_get,
  nfc_data_create_post,
  nfc_data_delete,

 };
 