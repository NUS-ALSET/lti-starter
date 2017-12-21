//const commonService = require('./common.service');
const groupService = require('./group.service');
const userService = require('./user.service');
const answerService = require('./answer.service');

exports.create = function (res, db, group_id, uid, name){
	
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

	groupService.isAccess(db, group_id, uid).then(function(isAccess){

		if (isAccess == true){
			userService.isInstructor(db, uid).then(function(isInstructor){
				db.ref('questions').orderByChild("group_id").equalTo(group_id).once('value').then(function(snapshot) {
					var jsonData = snapshot.val();
					var arrResult = [];
					var arrAnswers = [];
					
					for (var key in jsonData) {
						if (jsonData.hasOwnProperty(key)) {
							arrAnswers = [];
							var _uid = uid;
							if (isInstructor == true){
								// Load all answers of the question id
								_uid = null;
							}
							
							answerService.getByQuestionId(db, key, _uid).then(function(data){
								console.log("key: " + key);
								console.log("_uid: " + _uid);
								console.log(data);
							});
								
							arrResult.push({id: key, group_id: jsonData[key].group_id, name: jsonData[key].name, uid: jsonData[key].uid, answer_data: [{uid: 124, content: 'rock'},{uid: 111, content: 'tay'} ]});
						}
					}
					
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify(arrResult));
				});
			});
		}
	});
};
