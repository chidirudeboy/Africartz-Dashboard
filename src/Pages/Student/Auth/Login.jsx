// import { Button, FormControl, FormLabel, Text } from "@chakra-ui/react";
// import React, { useContext, useState } from "react";
// import { Link } from "react-router-dom";
// import GlobalContext from "../../../Context";
// import { StudentLoginAPI } from "../../../Endpoints";
// import useNotifier from "../../../hooks/useNotifier";
// import { postAuth } from "../../../utils/fetchAPI";

// function Login() {
// 	const [email, setEmail] = useState("");
// 	const [password, setPassword] = useState("");
// 	const [loading, setLoading] = useState(false);

// 	const { logUserIn, storeToken } = useContext(GlobalContext);

// 	const notify = useNotifier();

// 	const handleLogin = (e) => {
// 		e.preventDefault();

// 		// Validate inputs
// 		if (
// 			email === null ||
// 			email?.trim()?.length < 1 ||
// 			password === null ||
// 			password?.trim()?.length < 1
// 		) {
// 			return notify(
// 				"Validation error",
// 				"All form fields are required",
// 				"error"
// 			);
// 		}

// 		setLoading(true);

// 		const reqBody = { email, password };

// 		const handleResult = (result) => {
// 			setLoading(false);
// 			if (result?.status === "success") {
// 				notify("Success", "Redirecting to your dashboard...");

// 				storeToken(result?.token, "student");
// 				logUserIn("student");
// 			} else {
// 				let errors = result?.errors;

// 				if (errors && Object.keys(errors).length > 0) {
// 					for (let err in errors) {
// 						notify(errors[`${err}`][0], "", "error");
// 					}
// 				} else {
// 					notify("Failed", result?.message, "error");
// 				}
// 			}
// 		};

// 		const catchError = (error) => {
// 			setLoading(false);

// 			let errors = error?.errors;

// 			if (errors && Object.keys(errors).length > 0) {
// 				for (let err in errors) {
// 					notify(errors[`${err}`][0], "", "error");
// 				}
// 			} else {
// 				notify("Failed", error?.message, "error");
// 			}
// 		};

// 		postAuth(StudentLoginAPI, reqBody, handleResult, catchError);
// 	};

// 	return (
// 		<React.Fragment>
// 			<form onSubmit={handleLogin}>
// 				<FormControl className="form-control">
// 					<FormLabel>Email Address</FormLabel>
// 					<input
// 						type="email"
// 						value={email}
// 						onChange={(e) => setEmail(e.target.value)}
// 						disabled={loading}
// 						placeholder="Enter Email Address"
// 					/>

// 					<FormLabel>Password</FormLabel>
// 					<input
// 						type="password"
// 						value={password}
// 						onChange={(e) => setPassword(e.target.value)}
// 						disabled={loading}
// 						placeholder="Enter Password"
// 					/>
// 					<br />

// 					<Button
// 						type="submit"
// 						isLoading={loading}
// 						className="form-btn"
// 						w="100%"
// 						my="2"
// 						mb="5"
// 						loadingText="Loading"
// 						colorScheme="blue.400"
// 						variant="solid"
// 					>
// 						Log In
// 					</Button>

// 					<p className="f-password">
// 						<Link className="reset-password" to="/forgot-password">
// 							Forgot password?
// 						</Link>
// 					</p>
// 				</FormControl>
// 				<Text className="sign-up">
// 					Don't have an account?
// 					<Link className="sign-a" to="/register">
// 						{" "}
// 						Sign Up
// 					</Link>
// 				</Text>
// 			</form>
// 		</React.Fragment>
// 	);
// }

// export default Login;
