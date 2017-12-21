import commonService from './common.service';

export const questionService = {
    create,
    getAll,
    getById,
	getByGroupId
};

function create(group_id, name) {
	console.log("token: " + commonService.getToken());
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + commonService.getToken() },
        body: JSON.stringify({group_id: group_id, name: name})
    };

    return fetch('/questions/create', requestOptions).then(commonService.handleResponse);
}

function getAll() {
    const requestOptions = {
        method: 'POST',
        headers: commonService.authHeader()
    };

    return fetch('/questions', requestOptions).then(commonService.handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'POST',
        headers: commonService.authHeader()
    };

    return fetch('/questions/' + id, requestOptions).then(commonService.handleResponse);
}

function getByGroupId(group_id) {
    const requestOptions = {
        method: 'POST',
        headers: commonService.authHeader()
    };

    return fetch('/questions/group/' + group_id, requestOptions).then(commonService.handleResponse);
}

/*function handleResponse(response) {
    if (!response.ok) { 
        return Promise.reject(response.statusText);
    }

    return response.json();
}*/