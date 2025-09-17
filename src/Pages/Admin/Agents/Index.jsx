import React, { Fragment, useState, useEffect } from "react";
import { Flex, SimpleGrid, Spinner, Text, useToast } from "@chakra-ui/react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { AdminGetAgentAPI } from "../../../Endpoints";

const AgentsTable = () => {
	const [loading, setLoading] = useState(false);
	const [totalAgents, setTotalAgents] = useState(0);
	const [agents, setAgents] = useState([]);
	const toast = useToast();

	const fetchAgents = async () => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");

			if (!authToken) {
				throw new Error("No authentication token found");
			}

			const response = await axios.get(AdminGetAgentAPI, {
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				}
			});

			if (response.data.status === "success") {
				setTotalAgents(response.data.results);
				setAgents(response.data.data);
			} else {
				throw new Error(response.data.message || "Failed to fetch agents");
			}
		} catch (error) {
			console.error("Error fetching agents:", error);

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
		fetchAgents();
	}, []);

	// Format date to readable format
	const formatDate = (dateString) => {
		const options = { year: 'numeric', month: 'short', day: 'numeric' };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	// Combine first and last name
	const fullNameTemplate = (rowData) => {
		return `${rowData.firstName} ${rowData.lastName}`;
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
						{/* You can add statistics cards here if needed */}
					</SimpleGrid>

					<Card p="16px" mt="20px" w="100%">
						<CardHeader>
							<Flex justify="space-between" align="center" minHeight="60px" w="100%">
								<Text fontSize="lg" color={"#de9301"} fontWeight="bold">
									Registered Agents ({totalAgents})
								</Text>
							</Flex>
						</CardHeader>

						<CardBody display={"block"}>
							<DataTable
								value={agents}
								paginator
								rows={5}
								rowsPerPageOptions={[5, 10, 25, 50]}
								emptyMessage="No agents found, Try again later."
								loading={loading}
							>
								<Column
									sortable
									field="firstName"
									header="Agent Name"
									body={fullNameTemplate}
									style={{ width: "25%" }}
								></Column>

								<Column
									sortable
									field="email"
									header="Agent Email"
									style={{ width: "25%" }}
								></Column>

								<Column
									sortable
									field="phone"
									header="Agent Phone"
									style={{ width: "20%" }}
								></Column>

								<Column
									sortable
									field="apartmentCount"
									header="Apartments"
									style={{ width: "15%" }}
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

export default AgentsTable;
