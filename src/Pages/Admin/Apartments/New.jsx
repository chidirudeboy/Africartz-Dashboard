// import React, { useState, useContext, useCallback, useEffect } from "react";
import GlobalContext from "../../../Context.jsx";
import useNotifier from "../../../hooks/useNotifier.jsx";
import { Button, FormControl, Stack, Input, Flex } from "@chakra-ui/react";
import Card from "../../../components/Footer/Card/Card.js";
import CardBody from "../../../components/Footer/Card/CardBody.js";
import { fetchProtectedResource } from "../../../utils/fetchAPI.jsx";
import { AddStaffAPI } from "../../../Endpoints.jsx";
import { useContext, useState } from "react";

const inputStyles = { opacity: 1, cursor: "text" };

const AddStaffs = () => {
	const { token } = useContext(GlobalContext);
	const [loading, setLoading] = useState(false);
	const [staff, setStaff] = useState({
		name: "",
		email: "",
		role: "",
	});

	const handleChange = (prop) => (e) => {
		const { value } = e.target;
		setStaff((prev) => ({ ...prev, [prop]: value }));
	};

	const notify = useNotifier();

	const onSubmit = (e) => {
		e.preventDefault();

		setLoading(true);

		const handleSuccess = (_res) => {
			notify("Success", _res?.message, "success");

			setStaff({
				name: "",
				email: "",
				role: "",
			});
			setLoading(false);
		};

		const handleError = () => {
			setLoading(false);
			notify("Oppss...", "Check your network connection", "error");
		};

		fetchProtectedResource({
			url: AddStaffAPI,
			method: "POST",
			data: staff,
			token,
			handleSuccess,
			handleError,
		});
	};

	return (
		<Flex direction="column" pt={{ base: "120px", md: "75px" }}>
			<Card p="16px" w={{ md: "70%", sm: "100%" }}>
				<CardBody display={"block"} style={{ flexDirection: "row" }}>
					<form onSubmit={onSubmit}>
						<Stack spacing={6} px={6} py={8} >
							<Stack spacing={0}>
								<label>Name</label>
								<Input
									size="md"
									value={staff.name}
									style={inputStyles}
									onChange={handleChange("name")}
								/>
							</Stack>

							<Stack spacing={0}>
								<label>Email</label>
								<Input
									size="md"
									value={staff.email}
									style={inputStyles}
									onChange={handleChange("email")}
								/>
							</Stack>

							<Stack spacing={0}>
								<label>Role</label>
								<Input
									size="md"
									value={staff.role}
									style={inputStyles}
									onChange={handleChange("role")}
								/>
							</Stack>

							<FormControl>
								<Button
									type="submit"
									isLoading={loading}
									fontSize="12px"
									fontWeight="medium"
									borderRadius={"100px"}
									px={6}
									w="max"
									mt={4}
									bg="#de9301"
									_hover="none"
									_active={{
										bg: "white",
										transform: "none",
										borderColor: "transparent",
									}}
									_focus={{
										boxShadow: "none",
									}}
									color="white"
								>
									Add Staff
								</Button>
							</FormControl>
						</Stack>
					</form>
				</CardBody>
			</Card>
		</Flex>
	);
};

export default AddStaffs;
