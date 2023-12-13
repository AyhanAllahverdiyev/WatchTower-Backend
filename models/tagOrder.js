const mongoose = require("mongoose");

const tagOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  card_id :{
    type: String,
    required: true,
  },
  loc: {
    lat: {
      type: String,
      required: true,
    },
    long: {
      type: String,
      required: true,
    },
  },
  
},
{
  timestamps: { createdAt: false, updatedAt: false },
  collection: "tagOrder",
});
 

const TagOrderData = mongoose.model("tagOrder", tagOrderSchema);

module.exports = TagOrderData;
