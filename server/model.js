exports.getMessages = function(response, db, uid){
	db.ref('messages').orderByChild("uid").equalTo(uid).once('value').then(function(snapshot) {
		response.setHeader('Content-Type', 'application/json');
		response.send(JSON.stringify(snapshot.val()));
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