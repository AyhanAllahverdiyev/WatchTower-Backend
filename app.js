const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const WebSocket = require('ws');
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
dotenv.config();
const { requireAuth } = require("./middleware/authMiddleware");
const authRoutes = require("./routes/auth_Routes");
const nfcDataRoutes = require("./routes/nfc_dataRoutes");
// const orderRoutes = require("./routes/order_Array");
const passwordRoutes = require("./routes/password_Routes")
const tagOrderRoutes = require("./routes/tagOrder_Routes");
const sessionRoutes = require("./routes/session_Routes");
const pictureRoutes = require("./routes/picture_Routes");
const User = require("./models/User");
const { resetIsReadValues } = require("./controllers/nfc_dataController");
var serviceAccount = require("/Applications/development/WatchTower-Backend/watchtower-cloud-firebase-adminsdk-3kp4f-2dc80318d8.json");
const { TokenExpiredError } = require("jsonwebtoken");

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const dataFilePath = path.join(__dirname, "data.json");
const port = process.env.PORT || 3001;
const dbURI = process.env.MONGODB_URI;
const app = express();

app.use(cors());



app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' })); // Set JSON body parser with limit
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Set URL-encoded body parser with limit

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    // Set up the WebSocket server
    const wss = new WebSocket.Server({ noServer: true });

    // WebSocket connection handler
    wss.on('connection', (ws) => {
      console.log('WebSocket connection established');

      // Handle WebSocket messages
      ws.on('message', (message) => {
        if (typeof message === 'string') {
          console.log('Received message from WebSocket:', message);
        } else if (message instanceof Buffer) {
          // Convert binary data to a string
          const messageString = message.toString('utf8');
          message = messageString;
          console.log('Received message from WebSocket:', messageString);
        } else {
          console.log('Received message of an unexpected type from WebSocket:', message);
        }

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            console.log('Broadcasting message to WebSocket:', message);
            client.send(message);
          }
        });
      });

    });

    // Create an endpoint for broadcasting a message
    app.post('/broadcastFromServer', (req, res) => {
      try {
        const message = req.body.message; // Get the message from the request body

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });

        res.status(200).send('Message broadcasted to all clients from Firebase');
      } catch (err) {
        res.status(400).send(err);
      }
    });

    // Upgrade HTTP server to a WebSocket server
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
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

// Define routes
app.use("/logs", nfcDataRoutes);
app.use("/", authRoutes);
app.use("/password", passwordRoutes);
app.use("/tagOrder", tagOrderRoutes);
app.use("/session", sessionRoutes);
app.use ("/picture",pictureRoutes);
app.get('/sendHelloMessage', (req, res) => {
  admin.messaging().send({
    token: "d_ireUT9y0v6lfmNmypg-a:APA91bFuBH8Bx7rVPE_lwGKUAEvec6D-n9qDTdOXDTJL0z3WsAI0MpTlwRuXm_msdss7vvTim8Si3zoHUos0RItU8aj4RxIWOnXbio31dAZrvEVm63jc_eEKEykBMDsLfTsE7mJFFBSl",
    data: {
      hello: "world",
    },
  }).then((response) => {
    console.log('Successfully sent message:', response);
  });
  res.status(200).send('Message sent to device');
});
