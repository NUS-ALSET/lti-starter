function handleResponse(response) {
    if (!response.ok) { 
        return Promise.reject(response.statusText);
    }

    return response.json();
}

function authHeader() {
	
    let user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { 'Authorization': 'Bearer ' + user.token };
    } else {
        return {};
    }
}

function getToken() {
	
    let user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return user.token;
    } else {
        return null;
    }
}

export default {
	handleResponse,
	authHeader,
	getToken
};