import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	AdminGetProfileAPI,
	GetAdminProfile,
	StudentProfileAPI,
} from "./Endpoints";
import { fetchAPI } from "./utils/fetchAPI";

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
		// Pick token from browser cookies
		let { token: tok, role } = getToken();

		// If no token exists, don't make the API call
		if (!tok) {
			setLoading(false);
			return;
		}

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
				logUserIn("admin", false);
				setToken(tok);
				setUserId(data?.profile?.id);
				setUsername(data?.profile?.name);
				setEmail(data?.profile?.email);
				setProfile(data?.profile);
			} else {
				// API returned error, remove invalid token
				removeToken();
			}
			setLoading(false);
		})
		.catch((err) => {
			console.error(err);
			removeToken();
			setLoading(false);
		});

		// eslint-disable-next-line
	}, []);

	const logUserIn = (as = "student", fetchProfile = true) => {
		setLoggedIn(true);
		if (as === "admin") {
			navigate("/admin/dashboard");
			setAdmin(true);
		} else {
			navigate("/user/dashboard");
		}

		if (fetchProfile) {
			fetchUserProfile();
		}
	};

	const logOut = () => {
		setLoggedIn(false);
		setAdmin(false);
		navigate("/login");
		removeToken();
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
