const express = require('express');
const morgan = require('morgan');
const path = require('path');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
var serviceAccount = require("./service-account.json");

// Load configuration
const config = require('./config');
var model = require('./model');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.data.databaseURL
});

const app = express();
var db = admin.database();

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// Serve static assets
//app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Always return the main index.html, so react-router render the route in the client
/*app.get('/', (req, res) => {
  //res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  res.send("Backend API");
});*/

// USERS
app.post('users', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

app.post('users/verify-token', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

app.post('users/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

// GROUP
app.post('user-group/create', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

// MESSAGES
app.post('messages/create', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

// Get all messages
app.get('/messages', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

// Get message by ID
app.get('/messages/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

module.exports = app;