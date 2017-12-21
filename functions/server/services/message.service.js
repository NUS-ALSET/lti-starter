//const commonService = require('./common.service');

exports.create = function(res, db, group_id, uid, message){
	// A message entry.
	var messageData = {
		group_id,
		uid: uid,
		message: message
	};
	
	// Get a key for a new Mesage.
	var newMessageKey = db.ref().child('messages').push().key;

	// Write the new message's data simultaneously in the messages list and the user's message list.
	var updates = {};
	updates['/messages/' + newMessageKey] = messageData;

	db.ref().update(updates);
	
	this.getById(res, db, newMessageKey);
	
}

exports.getAll = function (res, db, uid){
	db.ref('messages').once('value').then(function(snapshot) {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(snapshot.val()));
	});
};

exports.getByUserId = function (res, db, uid){
	db.ref('messages').orderByChild("uid").equalTo(uid).once('value').then(function(snapshot) {
		
		var jsonMessages = snapshot.val();
		var arrResult = [];
		
		for (var key in jsonMessages) {
			if (jsonMessages.hasOwnProperty(key)) {
				
				//console.log(key + " -> " + jsonMessages[key]);
				
				arrResult.push({id: key, message: jsonMessages[key].message, uid: jsonMessages[key].uid});
			}
		}
		
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(arrResult));
	});
};

exports.getByGroupId = function (res, db, group_id){
	db.ref('messages').orderByChild("group_id").equalTo(group_id).once('value').then(function(snapshot) {
		
		var jsonData = snapshot.val();
		var arrResult = [];
		
		for (var key in jsonData) {
			if (jsonData.hasOwnProperty(key)) {
				
				//console.log(key + " -> " + jsonData[key]);
				
				arrResult.push({id: key, group_id: jsonData[key].group_id, uid: jsonData[key].uid, message: jsonData[key].message});
			}
		}
		
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(arrResult));
	});
};

exports.getById = function (res, db, id){
	db.ref('messages/' + id).once('value').then(function(snapshot) {
		res.setHeader('Content-Type', 'application/json');
		var jsonMessages = snapshot.val();
		if (typeof(jsonMessages.message) != "undefined"){
			res.send(JSON.stringify({id: id, message: jsonMessages.message, uid: jsonMessages.uid}));
		}else{
			res.send(JSON.stringify({}));
		}
	});
}

exports.getByGroupID = function (res, db, group_id){
	db.ref('messages').orderByChild("group_id").equalTo(group_id).once('value').then(function(snapshot) {
		
		var jsonMessages = snapshot.val();
		var arrResult = [];
		
		for (var key in jsonMessages) {
			if (jsonMessages.hasOwnProperty(key)) {
				
				//console.log(key + " -> " + jsonMessages[key]);
				
				arrResult.push({id: key, message: jsonMessages[key].message, uid: jsonMessages[key].uid, group_id: jsonMessages[key].group_id});
			}
		}
		
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(arrResult));
	});
};