const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
dotenv.config();
const { requireAuth } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/auth_Routes");
const nfcDataRoutes = require("./routes/nfc_dataRoutes");
const orderRoutes = require("./routes/order_Array");

const dataFilePath = path.join(__dirname, "data.json");

const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Parse application/json
app.use(bodyParser.json());

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

app.get("/about", requireAuth, (req, res) => {
  res.render("about", { title: "About" });
});
app.use("/logs", requireAuth, nfcDataRoutes);
app.use("/", authRoutes);
app.use("/order", requireAuth, orderRoutes);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
