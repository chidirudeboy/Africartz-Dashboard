export const fetchAPI = (
	endpoint,
	handleResult,
	catchError,
	token = "",

	options = {
		method: "GET",
		headers: new Headers({
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		}),
	}
) => {
	return fetch(endpoint, options)
		.then((response) => response.json())
		.then((res) => {
			handleResult(res);
		})
		.catch((err) => {
			catchError(err);
		});
};

// export const fetchProtectedResource = async ({
// 	url,
// 	method = "GET",
// 	data,
// 	token,
// 	contentType = "application/json",
// 	handleSuccess,
// 	handleError,
// }) => {
// 	const options = {
// 		method,
// 		headers: {
// 			"Content-Type": contentType,
// 			Authorization: `Bearer ${token}`,
// 			Accept: "application/json",
// 		},
// 		body: JSON.stringify(data),
// 	};

// 	try {
// 		const response = await fetch(url, options);
// 		const result = await response.json();

// 		if (!response.ok) {
// 			throw new Error(result);
// 		}

// 		handleSuccess(result);
// 	} catch (error) {
// 		handleError(error);
// 	}
// };
export const fetchProtectedResource = async ({
	url,
	method = "GET",
	data,
	token,
	contentType = "application/json",
	handleSuccess,
	handleError,
}) => {
	const options = {
		method,
		headers: {
			"Content-Type": contentType,
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
		},
	};

	if (method !== "GET" && method !== "HEAD") {
		options.body = JSON.stringify(data);
	}

	try {
		const response = await fetch(url, options);

		let result;
		try {
			result = await response.json();
		} catch (jsonError) {
			throw new Error("Failed to parse JSON response");
		}

		if (!response.ok) {
			const error = new Error(result.message || "Request failed");
			error.status = response.status;
			error.response = result;
			throw error;
		}

		handleSuccess(result);
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new Error("An unknown error occurred");
		}
		handleError(error);
	}
};

export const postAuth = async (
	endpoint,
	requestBody,
	handleResult,
	catchError,
	token = "",
	options = {
		method: "POST",
		headers: new Headers({
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		}),
		body: JSON.stringify(requestBody),
	}
) => {
	try {
		const response = await fetch(endpoint, options);
		const res = await response.json();
		console.log(res);
		handleResult(res);
	} catch (err) {
		catchError(err);
		console.log(err);
	}
};

export const postAuthFD = async (
	endpoint,
	requestBody,
	handleResult,
	catchError,
	token = "",
	options = {
		method: "POST",
		headers: new Headers({
			Accept: "application/json",
			"Content-Type": "boundary=" + Math.random().toString().substr(2),
			Authorization: `Bearer ${token}`,
		}),
		body: requestBody,
	}
) => {
	try {
		const response = await fetch(endpoint, options);
		const res = await response.json();
		console.log(res);
		handleResult(res);
	} catch (err) {
		catchError(err);
		console.error(err);
	}
};

export const putAuth = async (
	endpoint,
	requestBody,
	handleResult,
	catchError,
	token = "",
	options = {
		method: "PUT",
		headers: new Headers({
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		}),
		body: JSON.stringify(requestBody),
	}
) => {
	try {
		const response = await fetch(endpoint, options);
		const res = await response.json();
		console.log(res);
		handleResult(res);
	} catch (err) {
		catchError(err);
		console.error(err);
	}
};

export const deleteAuth = (
	endpoint,
	handleResult,
	catchError,
	token = "",
	options = {
		method: "DELETE",
		headers: new Headers({
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		}),
	}
) => {
	return fetch(endpoint, options)
		.then((response) => response.json())
		.then((res) => {
			console.log(res);
			handleResult(res);
		})
		.catch((err) => {
			console.log(err);
			catchError(err);
		});
};
