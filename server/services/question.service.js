//const commonService = require('./common.service');

exports.create = function (res, db, group_id, uid, name, password){
	
	// Get a key for a new question.
	var newKey = db.ref().child('questions').push().key;
	
	// A question entry.
	var dataEntry = {
		group_id: group_id,
		uid: uid,
		name: name
	};
	
	var updates = {};
	updates['/questions/' + newKey] = dataEntry;

	db.ref().update(updates);
	
	this.getById(res, db, newKey);
};

exports.getAll = function (res, db){
	db.ref('questions').once('value').then(function(snapshot) {
		var jsonData = snapshot.val();
		var arrResult = [];
		
		for (var key in jsonData) {
			if (jsonData.hasOwnProperty(key)) {
				
				arrResult.push({id: key, group_id: jsonData[key].group_id, name: jsonData[key].name, uid: jsonData[key].uid});
			}
		}
		
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(arrResult));
	});
};

exports.getById = function (res, db, id){
	db.ref('questions/' + id).once('value').then(function(snapshot) {
		
		var jsonData = snapshot.val();
		
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({id: id, group_id: jsonData.group_id, name: jsonData.name, uid: jsonData.uid}));
	});
}

exports.getByGroupId = function (res, db, group_id, uid){
	db.ref('questions').orderByChild("group_id").equalTo(group_id).once('value').then(function(snapshot) {
		var jsonData = snapshot.val();
		var arrResult = [];
		
		for (var key in jsonData) {
			if (jsonData.hasOwnProperty(key)) {
				
				arrResult.push({id: key, group_id: jsonData[key].group_id, name: jsonData[key].name, uid: jsonData[key].uid});
			}
		}
		
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(arrResult));
	});
};
