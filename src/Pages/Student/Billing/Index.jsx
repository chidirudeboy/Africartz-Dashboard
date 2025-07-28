import React, { useCallback, useContext, useEffect, useState } from "react";
// Chakra imports
import {
	Flex,
	Button,
	Stack,
	Heading,
	Tooltip,
	IconButton,
	Text,
	ButtonGroup,
	Badge,
	SkeletonText,
	Skeleton,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader";

import useNotifier from "../../../hooks/useNotifier";
import { fetchAPI } from "../../../utils/fetchAPI";
import {
	StudentBillingHistory,
	StudentCancelSubscription,
	StudentUpdatePaymentCard,
} from "../../../Endpoints";
import GlobalContext from "../../../Context";
import { IoReloadSharp } from "react-icons/io5";

const AdminBillingPage = () => {
	const [plan, setPlan] = useState();
	const [cPackage, setPackage] = useState();
	const [renewalDate, setRenewal] = useState();
	const [billingHistory, setHistory] = useState();
	const [loading, setLoading] = useState();

	const { token } = useContext(GlobalContext);

	const notify = useNotifier();

	const fetchData = useCallback(() => {
		setLoading(true);

		const handleSuccess = (_res) => {
			setLoading(false);

			if (_res?.status === "success") {
				setHistory(_res?.history);
				setRenewal(_res?.renewal_date);
				setPlan(_res?.plan);
				setPackage(_res?.package);
			} else {
				notify("", "Failed to get billing info", "error");
			}
		};

		const handleError = (_err) => {
			setLoading(false);

			notify("", "Failed to get billing info", "error");
		};

		fetchAPI(StudentBillingHistory, handleSuccess, handleError, token);
		// eslint-disable-next-line
	}, [token]);

	const changeCard = () => {
		setLoading(true);

		const handleSuccess = (_res) => {
			setLoading(false);

			if (_res?.status === "success") {
				notify("", _res?.message, "success");
			} else {
				notify("", _res?.message, "error");
			}
		};

		const handleError = (_err) => {
			setLoading(false);

			notify("", "Failed to update billing info", "error");
		};

		fetchAPI(StudentUpdatePaymentCard, handleSuccess, handleError, token);
	};

	const cancelSub = () => {
		setLoading(true);

		const handleSuccess = (_res) => {
			setLoading(false);

			if (_res?.status === "success") {
				notify("", _res?.message, "success");
			} else {
				notify("", _res?.message, "error");
			}
		};

		const handleError = (_err) => {
			setLoading(false);

			notify("", "Failed to cancel subscription", "error");
		};

		fetchAPI(StudentCancelSubscription, handleSuccess, handleError, token);
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
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
				<React.Fragment>
					<Stack spacing="3">
						<Heading
							as="h2"
							color="gray.400"
							fontWeight="bold"
							textTransform={"capitalize"}
						>
							Billing
						</Heading>
						<Text fontSize="xs" pb="10px">
							Manage billing information and view billing history
						</Text>
					</Stack>

					<Flex
						display={{ md: "flex", sm: "block" }}
						flexDirection="row-reverse"
						mt="20px"
						justify="space-between"
					>
						<Card
							mx={{ xl: "20px", md: "10px", sm: "0" }}
							mb={{ sm: "20px", md: "0" }}
							color="white"
							bg="blue.400"
							p="16px"
							h="30%"
							w={{ xl: "30%", md: "40%", sm: "100%" }}
						>
							<CardBody>
								<Stack mt="5" mb="3" spacing="2">
									<Text fontSize="md">Your plan</Text>

									<Heading as="h4">
										{plan}
										<sup>
											<Badge
												variant="solid"
												p=".25rem"
												px=".5rem"
												colorScheme="white"
											>
												{cPackage}
											</Badge>
										</sup>
									</Heading>

									<Text fontSize="xs" pb="10px">
										Renews on{" "}
										{dayjs(renewalDate).format(
											"ddd D MMM YYYY"
										)}
									</Text>

									<Flex
										flexDirection={"row"}
										flexWrap={"wrap"}
									>
										<Button
											variant="ghost"
											colorScheme="white"
											onClick={cancelSub}
											_hover={{
												bg: "rgba(255, 255, 255, 0.29)",
											}}
										>
											Cancel Subscription
										</Button>
										<Button
											variant="ghost"
											colorScheme="white"
											onClick={changeCard}
											_hover={{
												bg: "rgba(255, 255, 255, 0.29)",
											}}
										>
											Change Card
										</Button>
									</Flex>
								</Stack>
							</CardBody>
						</Card>

						<Card p="16px" w={{ md: "70%", sm: "100%" }}>
							<CardHeader>
								<Flex
									justify="space-between"
									align="center"
									minHeight="60px"
									w="100%"
								>
									<Text
										fontSize="lg"
										color={"blue.400"}
										fontWeight="bold"
									>
										Billing History
									</Text>

									<Tooltip label="Refresh">
										<IconButton
											onClick={() => fetchData()}
											icon={<IoReloadSharp />}
										/>
									</Tooltip>
								</Flex>
							</CardHeader>

							<CardBody
								display={"block"}
								style={{ flexDirection: "row" }}
							>
								<DataTable
									value={billingHistory}
									paginator
									rows={5}
									rowsPerPageOptions={[5, 10, 25, 50]}
								>
									<Column
										sortable
										field="created_at"
										filter
										header="Date"
										body={(row) => (
											<Text>
												{dayjs(row?.date).format(
													"ddd D MMM YYYY"
												)}
											</Text>
										)}
										style={{ width: "25%" }}
									></Column>
									<Column
										sortable
										field="created_at"
										filter
										header="Status"
										body={(row) => (
											<Badge
												variant="solid"
												p=".25rem"
												px=".5rem"
												colorScheme="twitter"
											>
												PAID
											</Badge>
										)}
										style={{ width: "25%" }}
									></Column>
								</DataTable>
							</CardBody>
						</Card>
					</Flex>
				</React.Fragment>
			)}
		</Flex>
	);
};

export default AdminBillingPage;
