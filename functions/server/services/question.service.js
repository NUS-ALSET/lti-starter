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
					
					var _uid = uid;
					if (isInstructor == true){
						// Load all answers of the question id
						_uid = null;
					}
							
					for (var key in jsonData) {
						if (jsonData.hasOwnProperty(key)) {
							arrAnswers = [];
							arrResult.push({id: key, group_id: jsonData[key].group_id, name: jsonData[key].name, uid: jsonData[key].uid, answer_data: []});
						}
					}
					
					// Get answers for each question
					var promises = [];
			
					for (k = 0; k < arrResult.length; k += 1) {
					  promises.push(
					  
						new Promise(function (resolve, reject) { 
							var selected_id = arrResult[k].id;
							
							answerService.getByQuestionId(db, selected_id, _uid).then(function(data){
								if (!data){
									resolve(null);
								}else{
									console.log(data);
									
									var question_id = (typeof(data[0]) != "undefined") ? data[0].question_id : null;
									
									if (question_id){
										resolve({question_id: question_id, data: data});
									}else{
										resolve(null);
									}
								}
							}).catch(err => {
								// handle errors
								console.log(err);
							});
							
						})
					  
					  );
					}
					
					// Add answers to questions list
					Promise.all(promises).then(function(results){
						// results is now an array of the response bodies
						
						if (results){
							for (i = 0; i< results.length; i += 1){
								if (results[i]){
									for (n = 0; n < arrResult.length; n += 1){
										if (results[i].question_id == arrResult[n].id){
											arrResult[n].answer_data = results[i].data;
										}
									}
								}
							}
						}
						
						res.setHeader('Content-Type', 'application/json');
						res.send(JSON.stringify(arrResult));
						
					}).catch(err => {
						// handle errors
						console.log(err);
						
						res.status(500).send('Unknown');
					});
					
					
					//res.setHeader('Content-Type', 'application/json');
					//res.send(JSON.stringify(arrResult));
				});
			});
		}
	});
};
