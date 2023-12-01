const express=require("express");
const { json } = require("body-parser");
const SessionData=require("../models/session");

module.exports.session_Check = (req, res) => {

}
module.exports.session_delete = (req, res) => {
    try{
        const user_id = req.body.user_id;
        const  sesionData=SessionData.findOne({userId:user_id});
        if(sessionData.isActive==false){
            sessionData.deleteOne();
            res.status(200).json({message:"Session deleted"});
        }
        else{
            console.log('No session found');
            res.status(404).json({message:"No session found"});
            
        }


    }catch(error){
        console.log(error);
        }
}

module.exports.session_Create = async (req, res) => {
         try {
           const { userId, isActive, tagOrderIsread } = req.body;
      
       
           const sessionData = await SessionData.create({
            userId,
            isActive,
            tagOrderIsread, 
          });
      
          res.status(201).json({ message: 'Session created', data: sessionData });
        } catch (error) {
        console.log(error);
          res.status(500).json({ error: error.message });
        }
      ;
}