const login = async () => {
	return fetch(process.env.URL_LOGIN, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		method: "POST",
		credentials: "include",
		body: new URLSearchParams({
			username: process.env.USERNAME,
			password: process.env.PASSWORD
		})
	}).then(e => `${e.headers.getSetCookie()}`.split(',').join(';')).catch(e=> e);
};

export default login