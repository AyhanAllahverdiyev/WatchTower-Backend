const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const nfcDataRoutes = require("./routes/nfc_dataRoutes");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI;
const app = express();

app.use(cors());
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

app.get("/", (req, res) => {
  res.redirect("/logs");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.use("/logs", nfcDataRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
