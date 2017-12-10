const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bearerToken = require('express-bearer-token');
var bodyParser = require('body-parser');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
var serviceAccount = require("./service-account.json");

// Load configuration
const config = require('./config');
//var model = require('./model');

const userService = require('./services/user.service');
const authService = require('./services/auth.service');
const messageService = require('./services/message.service');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.data.databaseURL
});

const app = express();

var db = admin.database();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Using Bearer Token
app.use(bearerToken());

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
app.post('/messages/create', (req, res) => {
  if (typeof(req.token) != "undefined"){
	  
	// Using Firebase Admin SDK to verify the token
	admin.auth().verifyIdToken(req.token)
	  .then(function(decodedToken) {
		var uid = decodedToken.uid;
		var message = "";
		if (typeof(req.body.message) != "undefined"){
		  message = req.body.message;
		}
		if (message){
			messageService.create(res, db, uid, message);
		}
	  }).catch(function(error) {
		// Handle error
		console.log(error);
	});
  }else{
	  res.status(403).send('Not Authorization');
  }
});

// Get all messages
app.get('/messages', (req, res) => {
	if (typeof(req.token) != "undefined"){
	  
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;

			messageService.getByUserID(res, db, uid);
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}else{
		res.status(403).send('Not Authorization');
	}
});

// Get all messages
app.get('/messages', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify({}));
});

// Get message by Message ID
app.get('/messages/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

module.exports = app;