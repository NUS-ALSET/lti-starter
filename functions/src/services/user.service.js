import commonService from './common.service';

export const userService = {
	verifyToken,
    getAll,
    getById,
	addGroupMember
};

function verifyToken(idToken) {
	// Get AccessToken from localstorage
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
        body: JSON.stringify({})
    };

    return fetch('/users/verify-token', requestOptions).then(commonService.handleResponse)
	.catch(function(err) {
		// Error :(
	});
}

function getAll() {
    const requestOptions = {
        method: 'POST',
        headers: commonService.authHeader(),
		body: JSON.stringify({})
    };

    return fetch('/users', requestOptions).then(commonService.handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'POST',
        headers: commonService.authHeader(),
		body: JSON.stringify({})
    };

    return fetch('/users/' + id, requestOptions).then(commonService.handleResponse);
}

function addGroupMember(groupId) {
	
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + commonService.getToken() },
        body: JSON.stringify({groupId})
    };

    return fetch('/user-group/create', requestOptions).then(commonService.handleResponse);
}

/*function handleResponse(response) {
    if (!response.ok) { 
        return Promise.reject(response.statusText);
    }

    return response.json();
}*/