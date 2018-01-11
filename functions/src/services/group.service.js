import commonService from './common.service';

export const groupService = {
    create,
    getAll,
    getById,
	createPassword,
	register
};

function create(name) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + commonService.getToken() },
        body: JSON.stringify({name: name})
    };

    return fetch('/groups/create', requestOptions).then(commonService.handleResponse);
}

function createPassword(group_id, pass) {
	console.log("Set Password");
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + commonService.getToken() },
        body: JSON.stringify({group_id: group_id, pass: pass})
    };

    return fetch('/groups/create-pass', requestOptions).then(commonService.handleResponse);
}

function register(group_id, pass) {
	console.log("Join Group");
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + commonService.getToken() },
        body: JSON.stringify({group_id: group_id, pass: pass})
    };

    return fetch('/groups/join', requestOptions).then(commonService.handleResponse);
}

function getAll() {
    const requestOptions = {
        method: 'POST',
        headers: commonService.authHeader()
    };

    return fetch('/groups', requestOptions).then(commonService.handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'POST',
        headers: commonService.authHeader()
    };

    return fetch('/groups/' + id, requestOptions).then(commonService.handleResponse).catch(function(err){console.log("ERROR"); console.log(err);return err;});
}

/*function handleResponse(response) {
    if (!response.ok) { 
        return Promise.reject(response.statusText);
    }

    return response.json();
}*/