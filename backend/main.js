const functions = require('firebase-functions');
const cors = require('cors');
const express = require('express');
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.post('/api/equipment/create/', (req, res) => {
  // Your function logic
  res.status(200).send("Equipment created!");
});

exports.api = functions.https.onRequest(app);
