exports.getMessages = function(response, db, uid){
	db.ref('messages').orderByChild("uid").equalTo(uid).once('value').then(function(snapshot) {
		response.setHeader('Content-Type', 'application/json');
		response.send(JSON.stringify(snapshot.val()));
	});
};

exports.getSecrets = function(db, consumerKey, callback){
	db.ref('secrets').orderByChild("consumer_key").equalTo(consumerKey).once('value').then(function(snapshot) {
		console.log("getSecrets: "+JSON.stringify(snapshot.val()));
		
		var jsonSecrets = snapshot.val();
		var consumerSecret = "";
		
		for (var key in jsonSecrets) {
			if (jsonSecrets.hasOwnProperty(key)) {
				console.log(key + " -> " + jsonSecrets[key]);
				
				// Get Secret value
				if (typeof (jsonSecrets[key].consumer_secret) != "undefined"){
					consumerSecret = jsonSecrets[key].consumer_secret;
				}
			}
		}
		
		callback(consumerKey, consumerSecret);
	});
};

exports.getGroupMembers = function (db, group_id, callback){
	db.ref('group_members/' + group_id).once('value').then(function(snapshot) {
		console.log("getMembersByGroupID: "+JSON.stringify(snapshot.val()));
		//..
	});
};

exports.getGroupMemberByID = function (db, group_id, uid, callback){
	db.ref('group_members/' + group_id).orderByChild("uid").equalTo(uid).once('value').then(function(snapshot) {
		console.log("getMembersByGroupID: "+JSON.stringify(snapshot.val()));
		//..
	});
};

exports.addGroupMember = function (db, group_id, uid, callback){
	// A Group Member entry.
	var groupMemberData = {
		group_id: group_id,
		uid: uid,
		status: 'active'
	};
	
	// Get a key for a new group member.
	//var newKey = admin.database().ref().child('group_members').push().key;
	var newKey = group_id;
	
	var updates = {};
	updates['/group_members/' + newKey] = groupMemberData;

	db.ref().update(updates);
};
