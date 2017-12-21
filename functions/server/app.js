const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bearerToken = require('express-bearer-token');
var bodyParser = require('body-parser');
const cors = require("cors");
var async = require("async");

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
var serviceAccount = require("./service-account.json");

// Load configuration
const config = require('./config');
//var model = require('./model');

const userService = require('./services/user.service');
const authService = require('./services/auth.service');
const messageService = require('./services/message.service');
const groupService = require('./services/group.service');
const questionService = require('./services/question.service');
const answerService = require('./services/answer.service');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.data.databaseURL
});

const app = express();

var db = admin.database();

app.enable('trust proxy');
app.use(cors({ origin: true }));

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
app.post('/users', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

app.post('/users/verify-token', (req, res) => {
  if (typeof(req.token) != "undefined"){
	  
	// Using Firebase Admin SDK to verify the token
	admin.auth().verifyIdToken(req.token)
	  .then(function(decodedToken) {
		var uid = decodedToken.uid;
		var classId = "";
		var classTitle = "";
		if (typeof(decodedToken.class_id) != "undefined"){
			classId = decodedToken.class_id;
		}
		if (typeof(decodedToken.class_title) != "undefined"){
			classTitle = decodedToken.class_title;
		}
		if(classId){
			groupService.create(res, db, classId, uid, classTitle, '');
			//groupService.addMember(res, db, classId, uid);
		}
		
		res.status(200).send('OK');
		
	  }).catch(function(error) {
		// Handle error
		console.log(error);
		res.status(403).send('Not Authorization');
	});
  }else{
	  res.status(403).send('Not Authorization');
  }
});

app.post('/users/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

// GROUPS
app.post('/groups/create', (req, res) => {
  if (typeof(req.token) != "undefined"){
	 
	var groupName = "";
	if (typeof(req.body.group_title) != "undefined"){
		groupName = req.body.group_name;
	}
	
	var groupPassword = "";
	if (typeof(req.body.group_password) != "undefined"){
		groupPassword = req.body.group_password;
	}
	if (!groupName){
		res.setHeader('Content-Type', 'application/json');
		response.send(JSON.stringify({"err": "Requires group name"}));
	}else{
	
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;
			
			groupService.create(res, db, null, uid, groupName, groupPassword);
			
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}
  }else{
	  res.status(403).send('Not Authorization');
  }
});

app.post('/groups', (req, res) => {
	if (typeof(req.token) != "undefined"){
	  
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;

			groupService.getByUserId(res, db, uid);
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}else{
		res.status(403).send('Not Authorization');
	}
});

app.post('/groups/:id', (req, res) => {
	if (typeof(req.token) != "undefined"){
	  
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;
			
			var id = "";
			if (typeof(req.params.id) != "undefined"){
				id = req.params.id;
			}
			if (id){
				groupService.getById(res, db, id, uid);
			}
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}else{
		res.status(403).send('Not Authorization');
	}
});

// QUESTIONS
app.post('/questions', (req, res) => {
  if (typeof(req.token) != "undefined"){
	 
	var groupId = "";
	if (typeof(req.body.group_id) != "undefined"){
		groupId = req.body.group_id;
	}
	
	if (!groupId){
		res.setHeader('Content-Type', 'application/json');
		response.send(JSON.stringify({"err": "Requires group"}));
	}else{
	
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			//var uid = decodedToken.uid;
			
			questionService.getByGroupId(res, db, groupId);
			
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}
  }else{
	  res.status(403).send('Not Authorization');
  }
});

app.post('/questions/create', (req, res) => {
  if (typeof(req.token) != "undefined"){
	 
	var name = "";
	if (typeof(req.body.name) != "undefined"){
		name = req.body.name;
	}
	
	var group_id = "";
	if (typeof(req.body.group_id) != "undefined"){
		group_id = req.body.group_id;
	}
	if (!name || !group_id){
		res.setHeader('Content-Type', 'application/json');
		response.send(JSON.stringify({"err": "Requires question name"}));
	}else{
	
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;
			
			questionService.create(res, db, group_id, uid, name);
			
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}
  }else{
	  res.status(403).send('Not Authorization');
  }
});

app.post('/questions/group/:group_id', (req, res) => {
  if (typeof(req.token) != "undefined"){
	 
	var groupId = "";
	if (typeof(req.params.group_id) != "undefined"){
		groupId = req.params.group_id;
	}
	
	if (!groupId){
		res.setHeader('Content-Type', 'application/json');
		response.send(JSON.stringify({"err": "Requires group"}));
	}else{
	
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;
			
			questionService.getByGroupId(res, db, groupId, uid);
			
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}
  }else{
	  res.status(403).send('Not Authorization');
  }
});

// ANSWERS
app.post('/answers', (req, res) => {
  if (typeof(req.token) != "undefined"){
	 
	var questionId = "";
	if (typeof(req.body.question_id) != "undefined"){
		questionId = req.body.question_id;
	}
	
	if (!questionId){
		res.setHeader('Content-Type', 'application/json');
		response.send(JSON.stringify({"err": "Requires question"}));
	}else{
	
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;
			
			answerService.getById(res, db, questionId);
			
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}
  }else{
	  res.status(403).send('Not Authorization');
  }
});

// MESSAGES
app.post('/messages/create', (req, res) => {
  if (typeof(req.token) != "undefined"){
	  
	// Using Firebase Admin SDK to verify the token
	admin.auth().verifyIdToken(req.token)
	  .then(function(decodedToken) {
		var uid = decodedToken.uid;
		var message = "";
		var group_id = "";
		
		if (typeof(req.body.message) != "undefined"){
		  message = req.body.message;
		}
		if (typeof(req.body.group_id) != "undefined"){
		  group_id = req.body.group_id;
		}
		if (message && group_id){
			messageService.create(res, db, group_id, uid, message);
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
app.post('/messages', (req, res) => {
	if (typeof(req.token) != "undefined"){
	  
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;

			messageService.getByUserId(res, db, uid);
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}else{
		res.status(403).send('Not Authorization');
	}
});

app.post('/messages/group/:group_id', (req, res) => {
	if (typeof(req.token) != "undefined"){
	  
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;
			
			var group_id = "";
			if (typeof(req.params.group_id) != "undefined"){
				group_id = req.params.group_id;
			}
	
			messageService.getByGroupId(res, db, group_id);
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}else{
		res.status(403).send('Not Authorization');
	}
});

// Get all messages
app.post('/messages', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify({}));
});

// Get message by Message ID
app.post('/messages/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  response.send(JSON.stringify({}));
});

module.exports = app;