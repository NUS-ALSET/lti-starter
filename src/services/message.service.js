import commonService from './common.service';

export const messageService = {
    create,
    getAll,
    getById,
	getByGroupId
};

function create(group_id, message) {
	console.log("token: " + commonService.getToken());
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + commonService.getToken() },
        body: JSON.stringify({group_id: group_id, message: message})
    };

    return fetch('/messages/create', requestOptions).then(commonService.handleResponse);
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: commonService.authHeader()
    };

    return fetch('/messages', requestOptions).then(commonService.handleResponse);
}

function getByGroupId(group_id) {
    const requestOptions = {
        method: 'GET',
        headers: commonService.authHeader()
    };

    return fetch('/messages/group/' + group_id, requestOptions).then(commonService.handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'GET',
        headers: commonService.authHeader()
    };

    return fetch('/messages/' + id, requestOptions).then(commonService.handleResponse);
}

/*function handleResponse(response) {
    if (!response.ok) { 
        return Promise.reject(response.statusText);
    }

    return response.json();
}*/