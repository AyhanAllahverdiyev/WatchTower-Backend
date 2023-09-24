const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nfcDataSchema = new Schema(
  {
    SerialNumber: {
      type: Number, 
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    uniqueNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "nfc_data",
  }
);

const NFCData = mongoose.model("NFCData", nfcDataSchema);
module.exports = NFCData;
