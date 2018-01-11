const functions = require('firebase-functions');

var expressHandlebars = require('express-handlebars');
const cors = require("cors");
const express = require("express");
var path    = require("path");
var btoa = require('btoa');
const bearerToken = require('express-bearer-token');
var bodyParser = require('body-parser');
const morgan = require('morgan');
var async = require("async");

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
var serviceAccount = require("./service-account.json");

// Load configuration
const config = require('./src/config');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.lti.databaseURL
});

//const firebase = require('firebase');
//const firebaseui = require('firebaseui');

// The ims-lti is to validate IMS LTI
const lti = require('ims-lti');

var db = admin.database();

var model = require('./model');
const userService = require('./server/services/user.service');
const authService = require('./server/services/auth.service');
const messageService = require('./server/services/message.service');
const groupService = require('./server/services/group.service');
const questionService = require('./server/services/question.service');
const answerService = require('./server/services/answer.service');

//
// AppLTI does not require additional login such as phone number
//
const appLTI = express();

appLTI.enable('trust proxy');
appLTI.use(cors({ origin: true }));

// parse application/x-www-form-urlencoded
appLTI.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
appLTI.use(bodyParser.json())

// Using Bearer Token
appLTI.use(bearerToken());

// Setup logger
appLTI.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));


appLTI.set('views', path.join(__dirname, 'views'));
appLTI.engine('handlebars', expressHandlebars({helpers: {
	toJSON : function(object) {
	return JSON.stringify(object);
	}
}}));

appLTI.set('view engine', 'handlebars');

// LTI POST
appLTI.post("/*", (request, response) => {
	
	var consumerKey = "";
	
	// Get consumer key parameter
	if (typeof(request.body.oauth_consumer_key) != "undefined"){
		consumerKey = request.body.oauth_consumer_key;
	}
	
	var callback = function (consumerKey, consumerSecret){
		
		console.log("CONSUMER KEY: " + consumerKey);
		console.log("CONSUMER SECRET: " + consumerSecret);
		
		var errCode = "";
		
		if (!consumerKey || !consumerSecret){
			
			// Consumer Key not Found
			var err = "\"" + consumerKey + " is not a valid consumer key.\" Please contact your administrator.";
			
			//CONSUMER_NOTFOUND
			response.render("index_lti", {"err": err, "is_valid": false, "config": config.lti, "body": request.body});
			
			return;
		}
		
		// Using ims-lti lib to validate the message
		var provider = new lti.Provider(consumerKey, consumerSecret);
		
		provider.valid_request(request, request.body, function(err, isValid){
			console.log("LTI err: " + err);
			console.log("LTI isValid:" + isValid);
			
			var displayName = "";
			if (isValid == true){
				displayName = request.body.user_id + "@" + consumerKey;
			}
			
			var roles = "";
			if (typeof(request.body.roles) != "undefined"){
				roles = request.body.roles;
			}
			
			var group_id = "";
			if (typeof(request.body.context_id) != "undefined"){
				group_id = request.body.context_id;
			}
			
			var group_title = "";
			if (typeof(request.body.context_title) != "undefined"){
				group_title = request.body.context_title;
			}
			
			// Using Firebase Admin SDK to create a custom token
			var uid = "";
			var user_id = "";
			
			if (typeof(request.body.user_id) != "undefined"){
				user_id = request.body.user_id;
			}
			
			uid = user_id + "@" + consumerKey;
			
			var additionalClaims = {
			  uid: uid,
			  uid_base64: btoa(uid),
			  class_id: group_id,
			  class_title: group_title,
			  login_type: 'LTI'
			};
			
			admin.auth().createCustomToken(uid, additionalClaims)
				.then(function(customToken) {
					console.log("created Custom Token");

					// Send custom token back to client
					//response.setHeader('Content-Type', 'application/json');
					//response.send(JSON.stringify({"uid": uid, "additionalClaims": additionalClaims, "accessToken": customToken}));
					
					
					if (isValid == true){
						//Add the LTI member to group members
						if (group_id){
							model.addGroupMember(db, group_id, uid);
						}
					}else{
						var str = "";
						if (err){
							str = err.toString();
						}
						if (str.indexOf('Invalid Signature') > -1){
							//INVALID_SECRET
							err = "\"An invalid secret was used to sign this login request for " + consumerKey + "\" Please contact your administrator.";
						}
					}
					
					response.render("index_lti", {"err": err, "is_valid": isValid, "uid": uid, "accessToken": customToken, "displayName": displayName, "roles": roles, "config": config.lti, "body": request.body});
				})
				.catch(function(error) {
					console.log("Error creating custom token:", error);
				});
			
			//response.render("index_lti", {"err": err, "is_valid": isValid, "displayName": displayName, "config": config.lti, "body": request.body});
		});
	}
	
	model.getSecrets(db, consumerKey, callback);
	
});

/*
// Verify Firebase Token and create firebase custom token
appLTI.put("*", (request, response) => {
	console.log("PUT");
	// Get Firebase Parameters
	var idToken = "";
	var auth_uid = "";
	var customToken = "";
	console.log(request.body);
	if (typeof(request.body.auth_uid) != "undefined"){
		auth_uid = request.body.auth_uid;
	}
	
	if (typeof(request.body.accessToken) != "undefined"){
		idToken = request.body.accessToken;
	}
	
	// Get LTI Parameters
	var oauth_consumer_key = "";
	var user_id = "";
	
	if (typeof(request.body.oauth_consumer_key) != "undefined"){
		oauth_consumer_key = request.body.oauth_consumer_key;
	}
	
	if (typeof(request.body.user_id) != "undefined"){
		user_id = request.body.user_id;
	}
	
	// Using Firebase Admin SDK to verify the token
	admin.auth().verifyIdToken(idToken)
	  .then(function(decodedToken) {
		//var uid = decodedToken.uid;
		//console.log("verified token uid: " + uid);
		
	  }).catch(function(error) {
		// Handle error
		console.log("Cannot verify Token");
	  });

	// Using Firebase Admin SDK to create a custom token
	var additionalClaims = {
	  oauth_consumer_key: oauth_consumer_key,
	  user_id: user_id
	};
	
	admin.auth().createCustomToken(auth_uid, additionalClaims)
		.then(function(customToken) {
			console.log("created Custom Token");

			// Send custom token back to client
			response.setHeader('Content-Type', 'application/json');
			response.send(JSON.stringify({"uid": auth_uid, "additionalClaims": additionalClaims, "accessToken": customToken}));
		
		})
		.catch(function(error) {
			console.log("Error creating custom token:", error);
		});
});*/


// Post message
appLTI.put("*", (request, response) => {
	console.log("PUT");
	
	// Get Parameters
	var accessToken = "";
	var message = "";
	console.log(request.body);
	
	if (typeof(request.body.accessToken) != "undefined"){
		accessToken = request.body.accessToken;
	}
	
	if (typeof(request.body.message) != "undefined"){
		message = request.body.message;
	}
	
	if (accessToken == ""){
		console.log("Invalid token, nothing to do");
		// Invalid token, nothing to do
		return;
	}
	// Using Firebase Admin SDK to verify the token
	admin.auth().verifyIdToken(accessToken)
	  .then(function(decodedToken) {
		var uid = decodedToken.uid;
		console.log(decodedToken);
		
		console.log("verified token uid: " + uid);
		
		if (message != ""){
			// A message entry.
			var messageData = {
				uid: uid,
				message: message
			};
			
			// Get a key for a new Mesage.
			var newMessageKey = admin.database().ref().child('messages').push().key;

			// Write the new message's data simultaneously in the messages list and the user's message list.
			var updates = {};
			updates['/messages/' + newMessageKey] = messageData;
			updates['/user-messages/' + btoa(uid) + '/' + newMessageKey] = newMessageKey;

			var result = db.ref().update(updates);
			console.log(result);
		}
		  // Send back to client
		  //response.setHeader('Content-Type', 'application/json');
		  //response.send(JSON.stringify({}));
		  model.getMessages(response, db, uid);
		
	  }).catch(function(error) {
		// Handle error
		console.log("Cannot verify Token" + error);
	});
});


// Signin Popup request
appLTI.get("/signin", (request, response) => {
	console.log("POST/signin");
	// Get user_id from Firebase Session
	//...
	
	response.render("popup_signin", {"config": config.lti});
});

// Verify and create custom token if any
appLTI.post("/signin/verify", (request, response) => {
	
	var accessToken = "";
	if (typeof(request.body.accessToken) != "undefined"){
		accessToken = request.body.accessToken;
	}
	
	if (accessToken == ""){
		console.log("Invalid token, nothing to do");
		// Invalid token, nothing to do
		return;
	}
	
	// Using Firebase Admin SDK to verify the token
	admin.auth().verifyIdToken(accessToken)
	  .then(function(decodedToken) {
		var uid = decodedToken.uid;
		response.setHeader('Content-Type', 'application/json');
		response.send(JSON.stringify({"status": "OK", "uid": uid}));
	  }).catch(function(error) {
		// Handle error
		console.log("Cannot verify Token" + error);
	  });
});

exports.ltiLogin = functions.https.onRequest((request, response) => {
	console.log("REQUEST");
	console.log(request);
	console.log(request.route);
	console.log(request.hostname);
	if (!request.path) {
		request.url = "/ltiLogin";
	}
	return appLTI(request, response);
})

//module.exports = appLTI;
//exports.ltiLogin = functions.https.onRequest(appLTI);

// API
const app = express();

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

//
// Server
//

// USERS
app.post('/users', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  res.send(JSON.stringify({}));
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
		
		userService.isInstructor(db, uid).then(function(isInstructor){
			
			// Auto Create Group when the logged LTI user is an instructor
			if(classId && isInstructor == true){
				groupService.create(res, db, classId, uid, classTitle, '');
			}
		
			res.setHeader('Content-Type', 'application/json');
			res.status(200).send({status: 'Ok', is_instructor: isInstructor});
			
		}).catch(function(err){
			// Handle error
			console.log(error);
			res.status(403).send('Unknown');
		});
		
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
  
  res.send(JSON.stringify({}));
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
		res.send(JSON.stringify({"err": "Requires group name"}));
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

			groupService.getAll(res, db, uid);
		  }).catch(function(error) {
			// Handle error
			console.log(error);
		});
	}else{
		res.status(403).send('Not Authorization');
	}
});

app.post('/groups/create-pass', (req, res) => {
  if (typeof(req.token) != "undefined"){
	 
	var groupId = "";
	if (typeof(req.body.group_id) != "undefined"){
		groupId = req.body.group_id;
	}
	
	var groupPassword = "";
	if (typeof(req.body.pass) != "undefined"){
		groupPassword = req.body.pass;
	}
	if (!groupId || !groupPassword){
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({"err": "Requires password"}));
	}else{
	
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;
			
			groupService.createPassword(res, db, groupId, uid, groupPassword);
			
		  }).catch(function(error) {
			// Handle error
			console.log(error);
			res.status(403).send('Not Authorization');
		});
	}
  }else{
	  res.status(403).send('Not Authorization');
  }
});

app.post('/groups/join', (req, res) => {
  if (typeof(req.token) != "undefined"){
	 
	var groupId = "";
	if (typeof(req.body.group_id) != "undefined"){
		groupId = req.body.group_id;
	}
	
	var groupPassword = "";
	if (typeof(req.body.pass) != "undefined"){
		groupPassword = req.body.pass;
	}
	if (!groupId || !groupPassword){
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({"err": "Requires password"}));
	}else{
	
		// Using Firebase Admin SDK to verify the token
		admin.auth().verifyIdToken(req.token)
		  .then(function(decodedToken) {
			var uid = decodedToken.uid;
			
			groupService.register(res, db, groupId, uid, groupPassword);
			
		  }).catch(function(error) {
			// Handle error
			console.log(error);
			res.status(403).send('Not Authorization');
		});
	}
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


app.post('/answers/create', (req, res) => {
  if (typeof(req.token) != "undefined"){
	  
	// Using Firebase Admin SDK to verify the token
	admin.auth().verifyIdToken(req.token)
	  .then(function(decodedToken) {
		var uid = decodedToken.uid;
		var content = "";
		var question_id = "";
		
		if (typeof(req.body.content) != "undefined"){
		  content = req.body.content;
		}
		if (typeof(req.body.question_id) != "undefined"){
		  question_id = req.body.question_id;
		}
		if (content && question_id){
			answerService.create(res, db, question_id, uid, content);
		}else{
			res.status(500).send('Invalid Parameters');
		}
	  }).catch(function(error) {
		// Handle error
		console.log(error);
	});
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
  res.send(JSON.stringify({}));
});

// Get message by Message ID
app.post('/messages/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  //...
  
  res.send(JSON.stringify({}));
});


exports.api = functions.https.onRequest(app);
