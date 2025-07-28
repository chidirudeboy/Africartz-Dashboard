import React, { Fragment, useState, useEffect } from "react";
import { Flex, SimpleGrid, Spinner, Text, useToast } from "@chakra-ui/react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { BsFillPeopleFill } from "react-icons/bs";
import { numberWithCommas } from "../../../utils/index.js";
import { AdminGetUsersAPI } from "../../../Endpoints";

const UsersTable = () => {
	const [loading, setLoading] = useState(false);
	const [totalUsers, setTotalUsers] = useState(0);
	const [users, setUsers] = useState([]);
	const toast = useToast();

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");

			if (!authToken) {
				throw new Error("No authentication token found");
			}

			const response = await axios.get(AdminGetUsersAPI, {
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				}
			});

			if (response.data.status === "success") {
				setTotalUsers(response.data.results);
				setUsers(response.data.data);
			} else {
				throw new Error(response.data.message || "Failed to fetch users");
			}
		} catch (error) {
			console.error("Error fetching users:", error);

			toast({
				title: "Error",
				description: error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});

			if (error.response?.status === 401) {
				// Handle token expiration
				localStorage.removeItem("authToken");
				toast({
					title: "Session Expired",
					description: "Please login again",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	// Format date to readable format
	const formatDate = (dateString) => {
		const options = { year: 'numeric', month: 'short', day: 'numeric' };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	// Combine first and last name
	const fullNameTemplate = (rowData) => {
		return `${rowData.first_name} ${rowData.last_name}`;
	};

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<Spinner size="xl" />
				</Flex>
			) : (
				<Fragment>
					<SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px">
						<Card p="16px">
							<Flex direction="column" align="center">
								<BsFillPeopleFill size="24px" color="#de9301" />
								<Text fontSize="md" fontWeight="bold" mt="10px">
									Total Users
								</Text>
								<Text fontSize="xl" fontWeight="bold">
									{numberWithCommas(totalUsers)}
								</Text>
							</Flex>
						</Card>
					</SimpleGrid>

					<Card p="16px" mt="20px" w="100%">
						<CardHeader>
							<Flex justify="space-between" align="center" minHeight="60px" w="100%">
								<Text fontSize="lg" color={"#de9301"} fontWeight="bold">
									Registered Users ({totalUsers})
								</Text>
							</Flex>
						</CardHeader>

						<CardBody display={"block"}>
							<DataTable
								value={users}
								paginator
								rows={5}
								rowsPerPageOptions={[5, 10, 25, 50]}
								emptyMessage="No users found"
								loading={loading}
							>
								<Column
									sortable
									field="first_name"
									header="Name"
									body={fullNameTemplate}
									style={{ width: "25%" }}
									filter
								></Column>

								<Column
									sortable
									field="email"
									header="Email"
									style={{ width: "25%" }}
									filter
								></Column>

								<Column
									sortable
									field="phone"
									header="Phone"
									style={{ width: "20%" }}
									filter
								></Column>

								<Column
									sortable
									field="createdAt"
									header="Joined Date"
									body={(row) => formatDate(row.createdAt)}
									style={{ width: "15%" }}
								></Column>
							</DataTable>
						</CardBody>
					</Card>
				</Fragment>
			)}
		</Flex>
	);
};

export default UsersTable;
