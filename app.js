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
  .then((result) => {
    // Set up the WebSocket server
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ noServer: true });

    // WebSocket connection handler
    wss.on('connection', (ws) => {
      console.log('WebSocket connection established');

      // Handle WebSocket messages
      ws.on('message', (message) => {
        if (typeof message === 'string') {
          console.log('Received message:', message);
        } else if (message instanceof Buffer) {
          // Convert binary data to a string
          const messageString = message.toString('utf8');
          console.log('Received message:', messageString);
        } else {
          console.log('Received message of an unexpected type:', message);
        }
      
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });
      
    });

    // Create an endpoint for broadcasting a message
    app.post('/broadcastFromServer', (req, res) => {
      const message = req.body.message; // Get the message from the request body

      // Broadcast the message to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      res.status(200).send('Message broadcasted to all clients');
    });

    // Upgrade HTTP server to a WebSocket server
    const server = app.listen(port);
    server.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  })
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

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.use("/logs", nfcDataRoutes);
app.use("/", authRoutes);
app.use("/order", orderRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
