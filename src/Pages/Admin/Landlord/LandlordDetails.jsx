// import React, { useState, useContext, useCallback, useEffect } from "react";
import GlobalContext from "../../../Context.jsx";
import useNotifier from "../../../hooks/useNotifier.jsx";
import {
	Button,
	FormControl,
	Grid,
	Input,
	Flex,
	Spinner,
	GridItem,
} from "@chakra-ui/react";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import { fetchProtectedResource } from "../../../utils/fetchAPI.jsx";
import {
	ViewLandlordDetailsAPI,
	UpdateLandlordDetailsAPI,
} from "../../../Endpoints.jsx";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const inputStyles = { opacity: 1, cursor: "text" };

const LandlordDetails = () => {
	const { id } = useParams();
	const { token } = useContext(GlobalContext);
	const [loading, setLoading] = useState(false);
	const [buttonLoading, setButtonLoading] = useState(false);

	const [landlord, setLandlord] = useState({
		account_name: "",
		account_number: "",
		bank_name: "",
		email: "",
		first_name: "",
		last_name: "",
		other_phone: "",
		phone: "",
	});

	const handleChange = (prop) => (e) => {
		const { value } = e.target;
		setLandlord((prev) => ({ ...prev, [prop]: value }));
	};

	const notify = useNotifier();

	const onSubmit = (e) => {
		e.preventDefault();

		setButtonLoading(true);

		const handleSuccess = (_res) => {
			notify("Success", _res?.message, "success");

			setButtonLoading(false);
		};

		const handleError = () => {
			setButtonLoading(false);
			notify("Oppss...", "Check your network connection", "error");
		};

		fetchProtectedResource({
			url: UpdateLandlordDetailsAPI + id,
			method: "POST",
			data: landlord,
			token,
			handleSuccess,
			handleError,
		});
	};

	useEffect(() => {
		const fetchLandlordDetails = () => {
			setLoading(true);

			const handleSuccess = (_res) => {
				notify("Success", _res?.message, "success");
				const { landlord } = _res;
				setLandlord({
					account_name: landlord.account_name,
					account_number: landlord.account_number,
					bank_name: landlord.bank_name,
					email: landlord.email,
					first_name: landlord.first_name,
					last_name: landlord.last_name,
					other_phone: landlord.other_phone,
					phone: landlord.phone,
				});
				setLoading(false);
			};

			const handleError = () => {
				setLoading(false);
				notify("Oppss...", "Check your network connection", "error");
			};

			fetchProtectedResource({
				url: ViewLandlordDetailsAPI + id,
				method: "GET",
				token,
				handleSuccess,
				handleError,
			});
		};
		fetchLandlordDetails();
	}, []);

	return (
		<Card p="16px" pt={{ base: "120px", md: "75px" }}>
			<CardBody display={"block"}>
				{loading ? (
					<Spinner />
				) : (
					<form onSubmit={onSubmit}>
						<Grid
							templateColumns={{
								base: "repeat(1, 1fr)",
								md: "repeat(2, 1fr)",
								lg: "repeat(4, 1fr)",
							}}
							gap={6}
						>
							<GridItem>
								<label>First Name</label>
								<Input
									size="md"
									focusBorderColor="gray.500"
									value={landlord.first_name}
									style={inputStyles}
									onChange={handleChange("first_name")}
								/>
							</GridItem>

							<GridItem>
								<label>last Name</label>
								<Input
									size="md"
									value={landlord.last_name}
									style={inputStyles}
									onChange={handleChange("last_name")}
								/>
							</GridItem>

							<GridItem>
								<label>Email</label>
								<Input
									size="md"
									value={landlord.email}
									style={inputStyles}
									onChange={handleChange("email")}
								/>
							</GridItem>

							<GridItem>
								<label>Phone</label>
								<Input
									size="md"
									value={landlord.phone}
									style={inputStyles}
									onChange={handleChange("phone")}
								/>
							</GridItem>

							<GridItem>
								<label>Other Phone</label>
								<Input
									size="md"
									value={landlord.other_phone}
									style={inputStyles}
									onChange={handleChange("other_phone")}
								/>
							</GridItem>
							<GridItem>
								<label>Account Name</label>
								<Input
									size="md"
									value={landlord.account_name}
									style={inputStyles}
									onChange={handleChange("account_name")}
								/>
							</GridItem>
							<GridItem>
								<label>Account Number</label>
								<Input
									size="md"
									value={landlord.account_number}
									style={inputStyles}
									onChange={handleChange("account_number")}
								/>
							</GridItem>
							<GridItem>
								<label>Bank Name</label>
								<Input
									size="md"
									value={landlord.bank_name}
									style={inputStyles}
									onChange={handleChange("bank_name")}
								/>
							</GridItem>
						</Grid>
						<FormControl>
							<Button
								type="submit"
								isLoading={buttonLoading}
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
								Update
							</Button>
						</FormControl>
					</form>
				)}
			</CardBody>
		</Card>
	);
};

export default LandlordDetails;
