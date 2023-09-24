const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const nfcDataRoutes = require("./routes/nfc_dataRoutes");

// express app
const app = express();

// connect to mongodb & listen for requests
const dbURI =
  "mongodb+srv://aykhan:68720103@nodetuts.pjavkkd.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// register view engine
app.set("view engine", "ejs");

// middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(function (req, res, next) {
  res.locals.path = req.path;
  res.locals.res = res;
  next();
});
// routes
app.get("/", (req, res) => {
  res.redirect("/logs");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// blog routes
app.use("/logs", nfcDataRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
