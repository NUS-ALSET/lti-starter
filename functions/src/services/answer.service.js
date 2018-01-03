import commonService from './common.service';

export const answerService = {
    create,
    getAll,
    getById
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

    return fetch('/answers', requestOptions).then(commonService.handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'POST',
        headers: commonService.authHeader()
    };

    return fetch('/answers/' + id, requestOptions).then(commonService.handleResponse);
}

/*function handleResponse(response) {
    if (!response.ok) { 
        return Promise.reject(response.statusText);
    }

    return response.json();
}*/