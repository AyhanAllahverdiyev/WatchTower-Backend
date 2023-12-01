const tagOrder=require("../models/tagOrder");
const { json } = require("body-parser");



module.exports.tagOrder_Get = (req, res) => {
    try {
        tagOrder.find({}, 'index name isRead')  
            .then((result) => {
                res.send(result);
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
            const { name, isRead, index } = item;
            return { name, isRead, index };
        });
         await tagOrder.deleteMany({}); 
        const insertedData = await tagOrder.insertMany(tagOrderObjects);

        if (insertedData) {
            res.status(200).send("Data saved");
        } else {
            res.status(500).send("Error saving data");
        }
    } catch (error) {
        res.status(500).send("Error saving data");
        console.log(error);
    }
}

