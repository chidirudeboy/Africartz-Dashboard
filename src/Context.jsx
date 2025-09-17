import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	GetAdminProfile,
} from "./Endpoints";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
	const [token, setToken] = useState("");
	const [isLoggedIn, setLoggedIn] = useState(false);
	const [isAdmin, setAdmin] = useState(false);
	const [isLoading, setLoading] = useState(true);


	const [userId, setUserId] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");

	const [profile, setProfile] = useState({
		name: "",
		email: "",
		status: "",
		role: "",
		email_verified_at: null,
		created_at: "",
	});

	const navigate = useNavigate();

	const getToken = () => {
		const token = "iopt=";
		const role = "iopt-as=";

		const ca = document.cookie.split(";");

		let res = {
			token: "",
			role: "",
		};

		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];

			while (c.charAt(0) === " ") {
				c = c.substring(1);
			}

			if (c.indexOf(token) === 0) {
				res.token = c.substring(token.length, c.length);
			}
			if (c.indexOf(role) === 0) {
				res.role = c.substring(role.length, c.length);
			}
		}

		console.log(res);
		return res;
	};

	const storeToken = (t, as = "student") => {
		var d = new Date();
		d.setTime(d.getTime() + 500 * 24 * 60 * 60 * 1000);

		var expires = "expires=" + d.toUTCString();
		document.cookie = "iopt=" + t + ";" + expires + ";path=/";
		document.cookie = "iopt-as=" + as + ";" + expires + ";path=/";

		setToken(t);
	};

	const removeToken = () => {
		const d = new Date();
		d.setTime(d.getTime() + -190 * 24 * 60 * 60 * 1000);

		const expires = "expires=" + d.toUTCString();
		document.cookie = "iopt=;" + expires + "path=/";
		document.cookie = "iopt-as=;" + expires + ";path=/";

		setToken("");
	};

	const fetchUserProfile = useCallback(() => {
		// Try to get token from localStorage first, then fall back to cookies
		let tok = localStorage.getItem("authToken");
		let role = "admin";

		if (!tok) {
			// Fallback to cookies if localStorage is empty
			const cookieData = getToken();
			tok = cookieData.token;
			role = cookieData.role;
		}

		// If no token exists or token is empty/invalid, don't make the API call
		if (!tok || tok.trim() === '' || tok === 'undefined' || tok === 'null') {
			console.log('No valid token found, skipping profile fetch');
			setLoading(false);
			return;
		}

		console.log('Fetching admin profile with token:', tok ? 'Token present' : 'No token');

		fetch(GetAdminProfile, {
			headers: new Headers({
				Authorization: `Bearer ${tok}`,
				Accept: "application/json",
			}),
		})
		.then((res) => res.json())
		.then((data) => {
			if(data?.status === 'success'){
				// Only log user in if the API call was successful
				setToken(tok);
				setLoggedIn(true);
				setAdmin(true);
				setUserId(data?.profile?.id);
				setUsername(data?.profile?.name);
				setEmail(data?.profile?.email);
				setProfile(data?.profile);
			} else {
				// API returned error, remove invalid token
				removeToken();
				localStorage.removeItem("authToken");
				localStorage.removeItem("refreshToken");
			}
			setLoading(false);
		})
		.catch((err) => {
			console.log('Profile fetch failed (user likely not logged in):', err.message || err);
			removeToken();
			localStorage.removeItem("authToken");
			localStorage.removeItem("refreshToken");
			setLoading(false);
		});

		// eslint-disable-next-line
	}, []);

	const logUserIn = (as = "student", profileData = null) => {
		setLoggedIn(true);
		if (as === "admin") {
			navigate("/admin/dashboard");
			setAdmin(true);
			
			// If profile data is provided (from login response), use it directly
			if (profileData) {
				setUserId(profileData.id);
				setUsername(profileData.name);
				setEmail(profileData.email);
				setProfile(profileData);
				setLoading(false);
			} else {
				// Otherwise fetch profile from API
				fetchUserProfile();
			}
		} else {
			navigate("/user/dashboard");
			if (!profileData) {
				fetchUserProfile();
			}
		}
	};

	const logOut = () => {
		setLoggedIn(false);
		setAdmin(false);
		navigate("/login");
		removeToken();
		localStorage.removeItem("authToken");
		localStorage.removeItem("refreshToken");
	};

	useEffect(() => {
		// check if user is logged in
		fetchUserProfile();
	}, [fetchUserProfile]);

	return (
		<GlobalContext.Provider
			value={{
				isLoggedIn,
				isAdmin,
				userId,
				token,
				isLoading,
				username,
				email,
				profile,
				setAdmin,
				logOut,
				logUserIn,
				storeToken,
				setLoading,
				fetchUserProfile,
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
}

export default GlobalContext;
