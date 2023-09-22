const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogRoutes");

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
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

// routes
app.get("/", (req, res) => {
  res.redirect("/tasks");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// blog routes
app.use("/tasks", blogRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

///////////////////////////////////////////////////////////

// app.get("/", (req, res) => {
//   res.sendFile("./views/index.html", { root: __dirname });
// });

// app.get("/about", (req, res) => {
//   res.sendFile("./views/about.html", { root: __dirname });
// });

// app.get("/about-us", (req, res) => {
//   res.redirect("/about");
// });

// app.use((req, res) => {
//   res.sendFile("./views/404.html", { root: __dirname });
//   res.status(404);
// });
