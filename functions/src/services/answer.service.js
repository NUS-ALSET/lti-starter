import commonService from './common.service';

export const answerService = {
    create,
    getAll,
    getById
};

function create(question_id, content) {
	console.log("token: " + commonService.getToken());
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + commonService.getToken() },
        body: JSON.stringify({question_id: question_id, content: content})
    };

    return fetch('/answers/create', requestOptions).then(commonService.handleResponse);
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