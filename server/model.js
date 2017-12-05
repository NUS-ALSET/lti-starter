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