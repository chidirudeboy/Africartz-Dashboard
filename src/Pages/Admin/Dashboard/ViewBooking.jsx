import React, { useState, useContext, useCallback, useEffect } from "react";
import GlobalContext from "../../../Context.jsx";
import useNotifier from "../../../hooks/useNotifier.jsx";
import {
	Button,
	FormControl,
	Stack,
	Input,
	Flex,
	SkeletonText,
	Skeleton,
} from "@chakra-ui/react";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import { useParams } from "react-router-dom";
import { fetchAPI } from "../../../utils/fetchAPI.jsx";
import {
	AdminScheduleBookingAPI,
	AdminSingleBookingAPI,
} from "../../../Endpoints.jsx";

const inputStyles = { opacity: 1, cursor: "text" };

const ViewBooking = () => {
	const { token } = useContext(GlobalContext);
	const [loading, setLoading] = useState(false);

	const [booking, setBooking] = useState({});

	const notify = useNotifier();
	const { id } = useParams();

	const fetchData = useCallback(() => {
		setLoading(true);

		const handleSuccess = (_res) => {
			if (_res?.status === "success") {
				setBooking(_res?.booking);
			} else {
				notify("Failed", "Could not get Booking data", "error");
			}

			setLoading(false);
		};

		const handleError = () => {
			setLoading(false);
			notify("Failed", "Could not get Booking data", "error");
		};

		fetchAPI(AdminSingleBookingAPI + id, handleSuccess, handleError, token);

		// eslint-disable-next-line
	}, [token]);

	const markAsScheduled = (e) => {
		e.preventDefault();
		const proceed = window.confirm(
			"Are you sure you'd like to mark this booking as scheduled?\n\n Note: This action cannot be undone!"
		);

		if (proceed) {
			const handleRes = (_res) => {
				if (_res?.status === "success") {
					notify("Success", _res?.message, "success");
					fetchData();
				} else {
					let errors = _res?.errors;

					if (errors && Object.keys(errors).length > 0) {
						for (let err in errors) {
							notify(errors[`${err}`][0], "", "error");
						}
					} else {
						notify("Failed", _res?.message, "error");
					}
				}
			};

			const catchErr = (_err) => {
				let errors = _err?.errors;

				if (errors && Object.keys(errors).length > 0) {
					for (let err in errors) {
						notify(errors[`${err}`][0], "", "error");
					}
				} else {
					notify("Failed", _err?.message, "error");
				}
			};

			fetchAPI(AdminScheduleBookingAPI + id, handleRes, catchErr, token);
		}
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<Flex direction="column" pt={{ base: "120px", md: "75px" }}>
			<Card p="16px" w={{ md: "70%", sm: "100%" }}>
				<CardBody display={"block"} style={{ flexDirection: "row" }}>
					{loading && (
						<Card p="6" bg="white">
							<SkeletonText
								mt="4"
								noOfLines={4}
								spacing="4"
								skeletonHeight="2"
							/>
							<Skeleton height="50px" mt="4" />
							<SkeletonText
								mt="4"
								noOfLines={4}
								spacing="4"
								skeletonHeight="2"
							/>
						</Card>
					)}

					{!loading && (
						<form onSubmit={markAsScheduled}>
							<Stack spacing={8}>
								<Stack spacing={3}>
									<label>First Name</label>
									<Input
										size="md"
										value={booking?.fname}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack spacing={3}>
									<label>Last Name</label>
									<Input
										size="md"
										value={booking?.lname}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack spacing={3}>
									<label>Email</label>
									<Input
										size="md"
										value={booking?.email}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack spacing={3}>
									<label>Title (Dr/Mr/Mrs/Miss/Ms)*</label>
									<Input
										type="text"
										size="md"
										value={booking?.title}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack>
									<label>Gender</label>
									<Input
										size="md"
										value={booking?.gender}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* name */}
								<Stack spacing={3}>
									<label>
										Date of Birth (as in your passport)
									</label>
									<Input
										type="date"
										size="md"
										value={booking?.dob}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* address */}
								<Stack spacing={3}>
									<label>Residential address</label>
									<Input
										size="md"
										value={booking?.residence}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* Phone */}
								<Stack spacing={3}>
									<label>Telephone/Mobile number</label>
									<Input
										size="md"
										value={booking?.phone}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* Zip/Postal code */}
								<Stack spacing={3}>
									<label>Zip/Postal code</label>
									<Input
										size="md"
										value={booking?.zip_code}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* Country of nationality*/}
								<Stack spacing={3}>
									<label>Country of nationality</label>
									<Input
										size="md"
										value={booking?.nationality}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack spacing={3}>
									<label>First Language</label>
									<Input
										size="md"
										value={booking?.first_language}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack>
									<label>IELTS Test Type</label>
									<Input
										size="md"
										value={booking?.test_type}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack>
									<label>
										Which IELTS test module are you taking
									</label>
									<Input
										size="md"
										value={booking?.test_module}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* Preferred date of test */}
								<Stack spacing={3}>
									<label>Preferred date of test</label>
									<Input
										type="date"
										size="md"
										value={booking?.pref_test_date}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* Second preferred date of test*/}
								<Stack spacing={3}>
									<label>Second preferred date of test</label>
									<Input
										type="date"
										size="md"
										value={booking?.pref_test_date2}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* Zip/Postal code */}
								<Stack spacing={3}>
									<label>
										Test City location(It is only standard
										IELTS that is available in Ilorin, Kwara
										State.)
									</label>
									<Input
										size="md"
										value={booking?.test_city}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/*Occupation (sector)*/}
								<Stack spacing={3}>
									<label>Occupation (sector)</label>
									<Input
										size="md"
										value={booking?.occupation}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack>
									<label>Occupation level</label>
									<Input
										size="md"
										value={booking?.occupation_level}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/*Where are you currently studying English(if applicable)?*/}
								<Stack spacing={3}>
									<label>
										Where are you currently studying
										English(if applicable)?
									</label>
									<Input
										size="md"
										value={booking?.place_of_study}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack>
									<label>
										What level of education have you
										completed?
									</label>
									<Input
										size="md"
										value={booking?.level_of_education}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack spacing={2}>
									<label>
										Which country are you applying to /
										intending to go to?
									</label>
									<Input
										size="md"
										value={booking?.intending_country}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack>
									<label>Reason for taking the test</label>
									<Input
										size="md"
										value={booking?.test_reason}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<Stack>
									<label>
										Do you have a permanent disability, such
										as a visual, hearing, or specific
										learning difficulty, which requires
										specificity arrangements?
									</label>
									<Input
										size="md"
										value={booking?.disability}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* Passport number */}
								<Stack spacing={3}>
									<label>Passport number</label>
									<Input
										size="md"
										value={booking?.passport_num}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* Passport expiry date */}
								<Stack spacing={3}>
									<label>Passport expiry date</label>
									<Input
										type="date"
										size="md"
										value={booking?.passport_expiry}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								{/* Passport issuing territory */}
								<Stack spacing={3}>
									<label>Passport issuing territory</label>
									<Input
										size="md"
										value={booking?.passport_territory}
										disabled={true}
										style={inputStyles}
									/>
								</Stack>

								<FormControl>
									<Button
										type="submit"
										isLoading={loading}
										disabled={loading}
										p={"8px 40px"}
										borderRadius={"5px"}
										colorScheme={
											booking?.scheduled === "1"
												? "green"
												: "twitter"
										}
										variant={"solid"}
										mt="10"
										isDisabled={booking?.scheduled === "1"}
									>
										{booking?.scheduled === "1"
											? "Scheduled"
											: "Mark as Scheduled"}
									</Button>
								</FormControl>
							</Stack>
						</form>
					)}
				</CardBody>
			</Card>
		</Flex>
	);
};

export default ViewBooking;
