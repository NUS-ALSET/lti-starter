//const commonService = require('./common.service');

exports.verifyToken = function (admin, accessToken, callback){
	// Using Firebase Admin SDK to verify the token
	admin.auth().verifyIdToken(accessToken)
	  .then(function(decodedToken) {
		var uid = decodedToken.uid;
		console.log(decodedToken);
		
	  }).catch(function(error) {
		// Handle error
		console.log("Cannot verify Token" + error);
	});
};