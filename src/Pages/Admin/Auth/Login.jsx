import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	Text,
} from "@chakra-ui/react";
import React, { Fragment, useContext, useState } from "react";
import GlobalContext from "../../../Context";
import { AdminLoginAPI } from "../../../Endpoints";
import useNotifier from "../../../hooks/useNotifier";
import { postAuth } from "../../../utils/fetchAPI";
import { Link, useNavigate } from "react-router-dom";



function AdminLogin() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();


	const { logUserIn, storeToken } = useContext(GlobalContext);
	const notify = useNotifier();

	const handleLogin = (e) => {
		e.preventDefault();

		if (!email.trim() || !password.trim()) {
			return notify("Validation error", "All form fields are required", "error");
		}

		setLoading(true);
		const reqBody = { email, password };
		console.log(reqBody);
		console.log(AdminLoginAPI);



		postAuth(
			AdminLoginAPI,
			reqBody,
			(result) => {
				setLoading(false);
				
				if (result?.refreshToken && result?.accessToken) {
					notify("Success", "Redirecting to your dashboard...");

					// Store tokens consistently - use accessToken for API calls
					localStorage.setItem("authToken", result.accessToken);
					localStorage.setItem("refreshToken", result.refreshToken);
					
					// Store in cookies using the accessToken for consistency
					storeToken(result.accessToken, "admin");

					// Log user in with profile data
					logUserIn("admin", result.admin);
					navigate("/admin/dashboard");
				}
				else {
					const errors = result?.errors;
					if (errors && Object.keys(errors).length > 0) {
						for (let err in errors) {
							notify(errors[err][0], "", "error");
						}
					} else {
						notify("Failed", result?.message, "error");
					}
				}
			},
			(error) => {
				setLoading(false);
				const errors = error?.errors;
				if (errors && Object.keys(errors).length > 0) {
					for (let err in errors) {
						notify(errors[err][0], "", "error");
					}
				} else {
					notify("Failed", error?.message, "error");
				}
			}
		);
	};

	return (
		<Fragment>
			<Box
				maxW="800px" // ⬅️ increased from 400px to 500px
				w="100%"     // ensure it stretches on smaller screens
				mx="auto"
				mt="40px"
				px="6"
				py="8"
				borderRadius="md"
				boxShadow="md"
				bg="white"
			>
				<form onSubmit={handleLogin}>
					<FormControl mb="4" isRequired>
						<FormLabel>Email Address</FormLabel>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
							placeholder="Enter Email Address"
						/>
					</FormControl>

					<FormControl mb="4" isRequired>
						<FormLabel>Password</FormLabel>
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
							placeholder="Enter Password"
						/>
					</FormControl>

					<Button
						type="submit"
						isLoading={loading}
						loadingText="Logging in..."
						colorScheme="yellow"
						w="100%"
						mb="4"
					>
						Log In Here Right Now
					</Button>

					<Text textAlign="center" fontSize="sm">
						<Link className="reset-password" to="/admin/forgot-password">
							Forgot password?
						</Link>
					</Text>
				</form>
			</Box>
		</Fragment>
	);
}

export default AdminLogin;
