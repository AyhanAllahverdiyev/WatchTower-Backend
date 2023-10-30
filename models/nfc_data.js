const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nfcDataSchema = new Schema(
  {
    ID: {
      type: String,
      required: true,
    },
    name: {
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
    battery_level: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "NFC_Data",
  }
);

const NFCData = mongoose.model("NFCData", nfcDataSchema);
module.exports = NFCData;
