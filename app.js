const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const nfcDataRoutes = require("./routes/nfc_dataRoutes");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const auth = require("./routes/auth_Routes");
const authRoutes = require("./routes/auth_Routes");
//mongodb+srv://<username>:<password>@nodetuts.pjavkkd.mongodb.net/?retryWrites=true&w=majority
const dataFilePath = path.join(__dirname, "data.json");
dotenv.config();

const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json);

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(port))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(function (req, res, next) {
  res.locals.path = req.path;
  res.locals.res = res;
  next();
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.redirect("/logs");
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/order", (req, res) => {
  try {
    // Read the JSON file and parse the data
    const data = JSON.parse(fs.readFileSync("./order.json"));

    // Extract the allowedOrderArray from the data
    const allowedOrderArray = data.allowedOrderArray || [];

    // Send the array as a JSON response
    res.json({ allowedOrderArray });
  } catch (error) {
    console.error("Error reading data from file:", error);
    res.status(500).json({ error: "Error reading data from file" });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/order", (req, res) => {
  try {
    const updatedArray = req.body.allowedOrderArray;

    // Ensure the updatedArray is an array
    if (!Array.isArray(updatedArray)) {
      return res.status(400).json({ error: "Invalid array format" });
    }

    // Update the array in the JSON file
    const updatedData = {
      allowedOrderArray: updatedArray,
    };
    fs.writeFile(
      "./order.json",
      JSON.stringify(updatedData, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          return res.status(500).json({ error: "Error writing to file" });
        }

        console.log("Array updated successfully:", updatedArray);
        res.json({ success: true, updatedArray });
      }
    );
  } catch (error) {
    console.error("Error updating array:", error);
    res.status(500).json({ error: "Error updating array" });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.use("/logs", nfcDataRoutes);
app.use("/auth", authRoutes);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
