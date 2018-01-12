//const commonService = require('./common.service');
var async = require("async");
var Promise = require('promise');
var userService = require('./user.service');

exports.create = function (res, db, group_id, uid, name, password){
	
	// Get a key for a new group member.
	var newKey = "";
	
	// If the id of group is not specified, the new group key will be generated
	if (group_id){
		newKey = group_id;
	}else{
		newKey = db.ref().child('groups').push().key;
	}
	
	// A Group entry.
	var groupData = {
		uid: uid,
		name: name,
		pass: password || ''
	};
	
	var updates = {};
	updates['/groups/' + newKey] = groupData;

	var _this = this;
	
	db.ref('groups/' + newKey).once('value').then(function(snapshot) {
		var jsonData = snapshot.val();
		
		if (!jsonData){
			db.ref().update(updates);
	
			// Auto add member to the created group
			_this.addMember(res, db, group_id, uid);
		}else{
			console.log("existed group");
		}
		
	}).catch(function(err){
		// Return error
		console.log(err);
		res.status(500).send(err.message);
	});
	
	
	
	// if the group id not specified, the created group will be returned
	if (!group_id){
		this.getById(res, db, newKey);
	}
};

exports.createPassword = function (res, db, group_id, uid, password){
	
	userService.isInstructor(db, uid).then(function(isInstructor){
		
		if (isInstructor == true){
			
			db.ref('groups/' + group_id).once('value').then(function(snapshot) {

				snapshot.ref.update({ pass: password || '' }).then(function(data){

					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({status: 'ok'}));
				}).catch(function(err){
					console.log(err);
					res.status(500).send(err.message);
				});
			}).catch(function(err){
				console.log(err);
				res.status(500).send(err.message);
			});
		}else{
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({err: 'Permission Denined'}));
		}
	
	}).catch(function(err){
		console.log(err);
		res.status(500).send(err.message);
	});
	
};
exports.getAll = function (res, db, uid){
	var _this = this;
	userService.isInstructor(db, uid).then(function(isInstructor){
		if (isInstructor == true){
			
			db.ref('groups').once('value').then(function(snapshot) {
				var jsonGroups = snapshot.val();
				var arrResult = [];
				
				for (var key in jsonGroups) {
					if (jsonGroups.hasOwnProperty(key)) {
						
						arrResult.push({id: key, group_name: jsonGroups[key].name, uid: jsonGroups[key].uid, has_password: (jsonGroups[key].pass) ? true: false});
					}
				}
				
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(arrResult));
			}).catch(function(err){
				console.log(err);
				res.status(500).send(err.message);
			});
		}else{
			_this.getByUserId(res, db, uid);
		}
	}).catch(function(err){
		console.log(err);
		res.status(500).send(err.message);
	});
};

exports.getByUserId = function (res, db, uid){
	console.log("group getByUserId");
	db.ref('group_members').orderByChild("uid").equalTo(uid).once('value').then(function(snapshot) {
		var jsonData = snapshot.val();
		var arrResult = [];
		
		for (var key in jsonData) {
			if (jsonData.hasOwnProperty(key)) {
				arrResult.push(jsonData[key].group_id);
			}
		}

		return arrResult;
	}).then(function(group_ids){

		if (group_ids && group_ids.length > 0){
			/*
			// For NodeJS 7.6 or later
			async.mapLimit(group_ids, group_ids.length, async function(map_group_id) {
				
				const data = await db.ref('groups/' + map_group_id).once('value').then(function(snapshot) {
					var jsonGroup = snapshot.val();
					return {id: map_group_id, group_name: jsonGroup.name, uid: jsonGroup.uid, has_password: (jsonGroup.pass) ? true: false};
				});
				
				return data;
			
			}, (err, results) => {
				if (err) throw err;
				
				// results is now an array of the response bodies
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(results));
			})
			*/
			
			var promises = [];
			
			for (k = 0; k < group_ids.length; k += 1) {
			  promises.push(
			  
				new Promise(function (resolve, reject) { 
					var selected_group_id = group_ids[k];
					db.ref('groups/' + group_ids[k]).once('value').then(function(snapshot) {
						var jsonGroup = snapshot.val();
						resolve({id: selected_group_id, group_name: jsonGroup.name, uid: jsonGroup.uid, has_password: (jsonGroup.pass) ? true: false});
					}).catch(err => {
						// handle errors
					});
				})
			  
			  );
			}
			
			Promise.all(promises).then(function(results){
				// results is now an array of the response bodies
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(results));
			}).catch(err => {
				// handle errors
			});
		}
	});
};

exports.getById = function (res, db, id, uid){
	var _this = this;
	
	db.ref('group_members/' + id).once('value').then(function(snapshot) {
		
		var jsonData = snapshot.val();
		
		if (!jsonData){
			return false;
		}
		
		console.log(jsonData);
		if (typeof(jsonData.uid) != "undefined"){
			if (jsonData.uid == uid){
				return true;
			}
		}
		
		for (var key in jsonData) {
			if (jsonData.hasOwnProperty(key)) {
				//console.log("value: " + jsonData[key].uid);
				if (jsonData[key].uid == uid){
					return true;
				}
			}
		}
		
		//if (!Object.keys(jsonData).length){
		//	return false;
		//}
		return false;
		
	}).then(function(isAccess){
		if (isAccess === true){
			console.log("isAccess: true");
			_this._getById(res, db, id, isAccess);
		}else{
			// Allow to view group details if the logged user is an Instructor
			userService.isInstructor(db, uid).then(function(isInstructor){
				if (isInstructor == true){
					_this._getById(res, db, id, isAccess);
				}else{
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({err: 'Permission Denined', id: id, is_access: false}));
				}
			}).catch(function(err){
				console.log(err);
				res.status(500).send(err.message);
			});
		}
	}).catch(function(err){
		console.log(err);
		res.status(500).send(err.message);
	});
	
}

exports._getById = function (res, db, id, isAccess){
	
	db.ref('groups/' + id).once('value').then(function(snapshot) {
		var jsonData = snapshot.val();
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({id: id, group_name: jsonData.name, uid: jsonData.uid, has_password: (jsonData.pass)? true: false, is_access: isAccess}));
	}).catch(function(err){
		// Return error
		res.status(500).send(err.message);
	});
}

// Async only works with NodeJS version 7.6 or later
/*
exports.isAccess = async function (db, id, uid){
	const data = await db.ref('group_members/' + id).once('value').then(function(snapshot) {
		console.log(snapshot.val());
		if (!snapshot){
			return false;
		}
		var jsonData = snapshot.val();
		
		if (typeof(jsonData.uid) != "undefined"){
			if (jsonData.uid == uid){
				return true;
			}
		}
		
		for (var key in jsonData) {
			if (jsonData.hasOwnProperty(key)) {
				console.log("value: " + jsonData[key].uid);
				if (jsonData[key].uid == uid){
					return true;
				}
			}
		}
		return false;
	});
	
	return data;
}
*/

// Promise for NodeJS < 7.6
exports.isAccess = function (db, id, uid){
	const data = new Promise(function (resolve, reject) {
		db.ref('group_members/' + id).once('value').then(function(snapshot) {
			if (!snapshot){
				resolve(false);
				//return false;
			}
			var jsonData = snapshot.val();
			
			if (typeof(jsonData.uid) != "undefined"){
				if (jsonData.uid == uid){
					resolve(true);
					//return true;
				}
			}
			
			for (var key in jsonData) {
				if (jsonData.hasOwnProperty(key)) {
					//console.log("value: " + jsonData[key].uid);
					if (jsonData[key].uid == uid){
						resolve(true);
						//return true;
					}
				}
			}
			resolve(false);
			//return false;
		});
	});
	
	return data;
}

exports.register = function (res, db, group_id, uid, password){
	
	var _this = this;
	
	db.ref('groups/' + group_id).once('value').then(function(snapshot) {
		var jsonData = snapshot.val();
		
		res.setHeader('Content-Type', 'application/json');
		if (!jsonData){
			res.send(JSON.stringify({err: 'Not Found', is_access: false}));
		}else if (password && password == jsonData.pass){
			_this.addMember(res, db, group_id, uid);
			res.send(JSON.stringify({id: group_id, group_name: jsonData.name, uid: jsonData.uid, has_password: (jsonData.pass)? true: false, is_access: true}));
		}else{
			res.send(JSON.stringify({err: 'Sorry, you are unable to join this group. Please try again', id: group_id, group_name: jsonData.name, uid: jsonData.uid, has_password: (jsonData.pass)? true: false, is_access: false}));
		}
		
	}).catch(function(err){
		// Return error
		res.status(500).send(err.message);
	});
}

exports.addMember = function (res, db, group_id, uid, callback){
	// A Member entry.
	var memberData = {
		group_id: group_id,
		uid: uid,
		status: 'active'
	};
	
	// Get a key for a new member.
	//var newKey = admin.database().ref().child('group_members').push().key;
	var newKey = group_id;
	
	var updates = {};
	updates['/group_members/' + newKey] = memberData;

	db.ref().update(updates);
};


exports.getMembers = function (res, db, group_id, callback){
	db.ref('group_members/' + group_id).once('value').then(function(snapshot) {
		console.log("getMembersByGroupID: "+JSON.stringify(snapshot.val()));
		
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(snapshot.val()));
	});
};

exports.getMemberByID = function (res, db, group_id, uid, callback){
	
	db.ref('group_members/' + group_id).orderByChild("uid").equalTo(uid).once('value').then(function(snapshot) {
		console.log("getMembersByGroupID: "+JSON.stringify(snapshot.val()));
		
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(snapshot.val()));
	});
};
