// import React, { useState, useContext, useCallback, useEffect } from "react";
import { Button, FormControl, Grid, GridItem, Input } from "@chakra-ui/react";
import { useContext, useState } from "react";
import GlobalContext from "../../../Context.jsx";
import { AddHotelOwnerAPI } from "../../../Endpoints.jsx";
import { fetchProtectedResource } from "../../../utils/fetchAPI.jsx";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import useNotifier from "../../../hooks/useNotifier.jsx";
// import AddHotelOwner from "../HotelOwner/new.jsx";

const inputStyles = { opacity: 1, cursor: "text" };

const AddOwner = () => {
	const { token } = useContext(GlobalContext);
	const [loading, setLoading] = useState(false);

	const [owner, setOwner] = useState({
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		other_phone: "",
		account_name: "",
		account_number: "",
		bank_name: "",
	});

	const handleChange = (prop) => (e) => {
		const { value } = e.target;
		setOwner((prev) => ({ ...prev, [prop]: value }));
	};

	const notify = useNotifier();

	const onSubmit = (e) => {
		e.preventDefault();

		setLoading(true);

		const handleSuccess = (_res) => {
			notify("Success", _res?.message, "success");

			setOwner({
				first_name: "",
				last_name: "",
				email: "",
				phone: "",
				other_phone: "",
				account_name: "",
				account_number: "",
				bank_name: "",
			});
			setLoading(false);
		};

		const handleError = () => {
			setLoading(false);
			notify("Oppss...", "Check your network connection", "error");
		};

		fetchProtectedResource({
			url: AddHotelOwnerAPI,
			method: "POST",
			data: owner,
			token,
			handleSuccess,
			handleError,
		});
	};

	return (
		<Card p="16px" w="100%" pt={{ base: "120px", md: "75px" }}>
			<CardBody>
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
								value={owner.first_name}
								style={inputStyles}
								onChange={handleChange("first_name")}
							/>
						</GridItem>

						<GridItem>
							<label>Last Name</label>
							<Input
								size="md"
								value={owner.last_name}
								style={inputStyles}
								onChange={handleChange("last_name")}
							/>
						</GridItem>

						<GridItem>
							<label>Email</label>
							<Input
								size="md"
								value={owner.email}
								style={inputStyles}
								onChange={handleChange("email")}
							/>
						</GridItem>

						<GridItem>
							<label>Phone</label>
							<Input
								size="md"
								value={owner.phone}
								style={inputStyles}
								onChange={handleChange("phone")}
							/>
						</GridItem>
						<GridItem>
							<label>Other Phone</label>
							<Input
								size="md"
								value={owner.other_phone}
								style={inputStyles}
								onChange={handleChange("other_phone")}
							/>
						</GridItem>
						<GridItem spacing={3}>
							<label>Account Name</label>
							<Input
								size="md"
								value={owner.account_name}
								style={inputStyles}
								onChange={handleChange("account_name")}
							/>
						</GridItem>
						<GridItem spacing={3}>
							<label>Account Number</label>
							<Input
								size="md"
								value={owner.account_number}
								style={inputStyles}
								onChange={handleChange("account_number")}
							/>
						</GridItem>
						<GridItem spacing={3}>
							<label>Bank Name</label>
							<Input
								size="md"
								value={owner.bank_name}
								style={inputStyles}
								onChange={handleChange("bank_name")}
							/>
						</GridItem>
					</Grid>
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
							Add Landlord
						</Button>
					</FormControl>
				</form>
			</CardBody>
		</Card>
	);
};

export default AddOwner;
