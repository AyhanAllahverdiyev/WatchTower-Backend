const tagOrder=require("../models/tagOrder");
const { json } = require("body-parser");
const WebSocket = require('ws');


const wss=new WebSocket.Server({port:9003});

wss.on('connection',ws=>{
  ws.on('message',message=>{
    console.log(`Received message => ${message}`);
  });

});


module.exports.tagOrder_Get = (req, res) => {
    try {
        tagOrder.find({}, { _id: 0, __v: 0 })
            .then((result) => {
                const modifiedResult = result.map(item => ({
                    loc: item.loc,
                    name: item.name,
                    isRead: item.isRead,
                    index: item.index,
                    card_id: item.card_id,
                }));
               
             
                console.log(modifiedResult);
                res.send(modifiedResult);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send(err);
            });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

 module.exports.tagOrder_Post = async (req, res) => {
    try {
        const data = req.body; 
        
        const tagOrderObjects = data.map(item => {
            const { name, isRead, index,card_id,loc } = item;
            return { name, isRead, index ,card_id,loc};
        });
         await tagOrder.deleteMany({}); 
        const insertedData = await tagOrder.insertMany(tagOrderObjects);

        if (insertedData) {
            wss.clients.forEach(client=>{
                client.send('update');
              
              })
            res.status(200).send("Data saved");
        } else {
            res.status(500).send("Error saving data");
        }
    } catch (error) {
        res.status(500).send("Error saving data");
        console.log(error);
    }
}

 