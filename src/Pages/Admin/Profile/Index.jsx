import React, { useContext, useState } from "react";
import {
	Flex,
	Heading,
	Button,
	Input,
	FormControl,
	FormLabel,
} from "@chakra-ui/react";
import useNotifier from "../../../hooks/useNotifier";
import { AdminUpdateProfileAPI } from "../../../Endpoints";
import { putAuth } from "../../../utils/fetchAPI";
import GlobalContext from "../../../Context";
import { isInValid } from "../../../utils";

const AdminProfile = () => {
	const {
		username,
		email: mail,
		token,
		fetchUserProfile,
	} = useContext(GlobalContext);

	const notify = useNotifier();

	const [name, setName] = useState(username);
	const [email, setEmail] = useState(mail);
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleUpdate = (e) => {
		e.preventDefault();

		if (isInValid(name) || isInValid(email)) {
			return notify(
				"Validation error",
				"All form fields are required",
				"error"
			);
		}

		setLoading(true);

		const reqBody = {
			name,
			email,
			password,
		};

		const handleResult = (result) => {
			setLoading(false);
			if (result?.status === "success") {
				notify("Profile updated successfully", "", "success");
				fetchUserProfile();
			} else {
				let errors = result?.errors;

				if (errors && Object.keys(errors).length > 0) {
					for (let err in errors) {
						notify(errors[`${err}`][0], "", "error");
					}
				} else {
					notify("Failed", result?.message, "error");
				}
			}
		};

		const catchError = (error) => {
			setLoading(false);

			let errors = error?.errors;

			if (errors && Object.keys(errors).length > 0) {
				for (let err in errors) {
					notify(errors[`${err}`][0], "", "error");
				}
			} else {
				notify("Failed", error?.message, "error");
			}
		};

		putAuth(
			AdminUpdateProfileAPI,
			reqBody,
			handleResult,
			catchError,
			token
		);
	};

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			<form onSubmit={handleUpdate}>
				<Heading
					size="md"
					mb="10"
					fontWeight="semi-bold"
					textTransform={"capitalize"}
				>
					Welcome Back! {username}
				</Heading>

				{/* Name */}
				<FormControl
					w={{ xl: "50%" }}
					variant="floating"
					id="first-name"
					mb={8}
				>
					<Input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={loading}
					/>
					<FormLabel>Name</FormLabel>
				</FormControl>

				{/* Email */}
				<FormControl
					w={{ xl: "50%" }}
					variant="floating"
					id="email"
					mb={8}
				>
					<Input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={loading}
					/>
					<FormLabel>Email Address</FormLabel>
				</FormControl>

				{/* Password */}
				<FormControl
					w={{ xl: "50%" }}
					variant="floating"
					id="password"
					mb={8}
				>
					<Input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={loading}
					/>
					<FormLabel>Password</FormLabel>
				</FormControl>

				<Button
					type="submit"
					isLoading={loading}
					loadingText="Updating"
					size="md"
					backgroundColor="#fccb08"
					color="white"
					height="48px"
					width={{ xl: "lg", md: "full", sm: "full" }}
					// variant="solid"
				>
					Update
				</Button>
			</form>
		</Flex>
	);
};

export default AdminProfile;
