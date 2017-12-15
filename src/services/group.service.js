import commonService from './common.service';

export const groupService = {
    create,
    getAll,
    getById
};

function create(name) {
	console.log("token: " + commonService.getToken());
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + commonService.getToken() },
        body: JSON.stringify({name: name})
    };

    return fetch('/groups/create', requestOptions).then(commonService.handleResponse);
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: commonService.authHeader()
    };

    return fetch('/groups', requestOptions).then(commonService.handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'GET',
        headers: commonService.authHeader()
    };

    return fetch('/groups/' + id, requestOptions).then(commonService.handleResponse);
}

/*function handleResponse(response) {
    if (!response.ok) { 
        return Promise.reject(response.statusText);
    }

    return response.json();
}*/