//const commonService = require('./common.service');
var async = require("async");
var Promise = require('promise');
var userService = require('./user.service');

exports.create = function (db, group_id, uid, name, password){
	var _this = this;
	const promise = new Promise(function (resolve, reject) {
		
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

		
		
		/*db.ref('groups/' + newKey).once('value').then(function(snapshot) {
			var jsonData = snapshot.val();
			
			if (!jsonData){
				db.ref().update(updates);
		
				// Auto add member to the created group
				_this.addMember(db, newKey, uid);
			}else{
				console.log("existed group");
			}
			
		}).catch(function(err){
			// Return error
			console.log(err);
			res.status(500).send(err.message);
		});*/
		
		_this.checkExist(db, newKey).then(function(isExist){
			if (!isExist){
				db.ref().update(updates).then(function(data){
				}).catch(function(err){
					console.log("couldn't create group");
					console.log(err);
				});
				
				_this.addMember(db, newKey, uid);
				_this._getById(db, newKey, true).then(function(data){
					resolve(data);
				}).catch(function(err){
					console.log(err);
					resolve(null);
				});
				
			}else{
				console.log('Sorry, the group Id is already existed.');
				resolve({err: 'Sorry, the group Id is already existed.'});
			}
		}).catch(function(err){
			console.log(err);
			reject(err);
		});
		
		// if the group id not specified, the created group will be returned
		//if (!group_id){
		//	this.getById(res, db, newKey);
		//}
	});
	
	return promise;
};

exports.checkExist = function (db, group_id){
	
	const promise = new Promise(function (resolve, reject) {
		db.ref('groups/' + group_id).once('value').then(function(snapshot) {
			var jsonData = snapshot.val();
			//console.log("Checking group: " + group_id);
			//console.log(jsonData);
			if (!jsonData){
				//console.log("FALSE");
				resolve(false);
			}else{
				// The group Id is already existed
				//console.log("TRUE");
				resolve(true);
			}
			
		}).catch(function(err){
			// Return error
			console.log(err);
			reject(err);
		});
	});
	
	return promise;
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
	/*userService.isInstructor(db, uid).then(function(isInstructor){
		if (isInstructor == true){
			
			db.ref('groups').once('value').then(function(snapshot) {
				var jsonGroups = snapshot.val();
				var arrResult = [];
				
				var isOnwer = false;
				
				if (jsonGroups){
					for (var key in jsonGroups) {
						if (jsonGroups.hasOwnProperty(key)) {
							isOnwer = false;
							
							if (uid == jsonGroups[key].uid){
								isOnwer = true;
							}
							
							arrResult.push({id: key, group_name: jsonGroups[key].name, uid: jsonGroups[key].uid, has_password: (jsonGroups[key].pass) ? true: false, is_owner: isOnwer});
						}
					}
				}
				
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(arrResult));
			}).catch(function(err){
				console.log(err);
				res.status(500).send(err.message);
			});
		}else{*/
			_this.getByUserId(res, db, uid);
		/*}
	}).catch(function(err){
		console.log(err);
		res.status(500).send(err.message);
	});*/
};

exports.getByUserId = function (res, db, uid){
	db.ref('group_members').orderByChild("uid").equalTo(uid).once('value').then(function(snapshot) {
		var jsonData = snapshot.val();
		var arrResult = [];
		
		if (jsonData){
			for (var key in jsonData) {
				if (jsonData.hasOwnProperty(key)) {
					arrResult.push(jsonData[key].group_id);
				}
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
						if(!jsonGroup){
							// Handle this case ...
							//reject(new Error('fail'));
							resolve(null);
						}else{
							var isOwner = false;
							
							if (jsonGroup.uid == uid){
								isOwner = true;
							}
							
							resolve({id: selected_group_id, group_name: jsonGroup.name, uid: jsonGroup.uid, has_password: (jsonGroup.pass) ? true: false, is_owner: isOwner});
						}
						
					}).catch(err => {
						// handle errors
						reject(err);
					});
				})
			  
			  );
			}
			
			Promise.all(promises).then(function(results){
				var arrResult = [];
				
				for (k = 0; k < results.length; k += 1) {
					if (results[k]){
						arrResult.push(results[k]);
					}
				}
				
				// results is now an array of the response bodies
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(arrResult));
			}).catch(err => {
				// handle errors
			});
		}else{
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify([]));
		}
	});
};

exports.getById = function (res, db, id, uid){
	var _this = this;
	
	_this.isAccess(db, id, uid).then(function(isAccess){
		if (isAccess === true){
			_this._getById(db, id, isAccess).then(function(data){
				res.setHeader('Content-Type', 'application/json');
				if (!data){
					res.send(JSON.stringify({err: 'Not Found', is_access: false}));
				}else{
					data["is_owner"] = false;
					if (typeof(data.uid) != "undefined"){
						if (uid && data.uid == uid){
							data["is_owner"] = true;
						}
					}
					res.send(JSON.stringify(data));
				}
			});
		}else{
			// Allow to view group details if the logged user is an Instructor
			//userService.isInstructor(db, uid).then(function(isInstructor){
			_this.isOwner(db, id, uid).then(function(isOwner){
				if (isOwner == true){
					_this._getById(db, id, isAccess).then(function(data){
						res.setHeader('Content-Type', 'application/json');
						if (!data){
							res.send(JSON.stringify({err: 'Not Found', is_access: false}));
						}else{
							data["is_owner"] = true;
							res.send(JSON.stringify(data));
						}
					});
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

exports._getById = function (db, id, isAccess){
	
	const promise = new Promise(function (resolve, reject) {
		
		db.ref('groups/' + id).once('value').then(function(snapshot) {
			var jsonData = snapshot.val();
			//res.setHeader('Content-Type', 'application/json');
			//res.send(JSON.stringify({id: id, group_name: jsonData.name, uid: jsonData.uid, has_password: (jsonData.pass)? true: false, is_access: isAccess}));
			if (!jsonData){
				resolve(null);
			}else{
				resolve({id: id, group_name: jsonData.name, uid: jsonData.uid, has_password: (jsonData.pass)? true: false, is_access: isAccess});
			}
			
		}).catch(function(err){
			// Return error
			console.log(err);
			//res.status(500).send(err.message);
			reject(err);
		});
	});
	
	return promise;
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
		db.ref('group_members').orderByChild("group_id").equalTo(id).once('value').then(function(snapshot) {
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

exports.isOwner = function (db, id, uid){
	var _this = this;
	
	const promise = new Promise(function (resolve, reject) {
		_this._getById(db, id).then(function(data){
			if (!data){
				resolve(false);
			}else{
				if (typeof(data.uid) == "undefined"){
					resolve(false);
				}else if(data.uid == uid){
					resolve(true);
				}else{
					resolve(false);
				}
			}
		}).catch(function(err){
			console.log(err);
			reject(err);
		});
	});
	
	return promise;
}

exports.register = function (res, db, group_id, uid, password){
	
	var _this = this;
	
	db.ref('groups/' + group_id).once('value').then(function(snapshot) {
		var jsonData = snapshot.val();
		
		res.setHeader('Content-Type', 'application/json');
		if (!jsonData){
			res.send(JSON.stringify({err: 'Not Found', is_access: false}));
		}else if (password && password == jsonData.pass){
			_this.addMember(db, group_id, uid);
			res.send(JSON.stringify({id: group_id, group_name: jsonData.name, uid: jsonData.uid, has_password: (jsonData.pass)? true: false, is_access: true}));
		}else{
			res.send(JSON.stringify({err: 'Sorry, you are unable to join this group. Please try again', id: group_id, group_name: jsonData.name, uid: jsonData.uid, has_password: (jsonData.pass)? true: false, is_access: false}));
		}
		
	}).catch(function(err){
		// Return error
		res.status(500).send(err.message);
	});
}

exports.addMember = function (db, group_id, uid){
	// A Member entry.
	var memberData = {
		group_id: group_id,
		uid: uid,
		status: 'active'
	};
	
	// Get a key for a new member.
	var newKey = db.ref().child('group_members').push().key;
	
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
