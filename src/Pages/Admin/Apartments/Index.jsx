import {
	Card,
	CardHeader,
	Flex,
	Spinner,
	Button,
	Tabs,
	Text,
	useToast,
	HStack,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import {
	AdminGetPendingApartmentsAPI,
	AdminApprovedApartment,
	AdminRejectApartment,
} from "../../../Endpoints";

const Index = () => {
	const [loading, setLoading] = useState(false);
	const [statusLoadingId, setStatusLoadingId] = useState(null);
	const [apartments, setApartments] = useState([]);
	const toast = useToast();

	const fetchPendingApartments = async () => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			const response = await axios.get(AdminGetPendingApartmentsAPI, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (response.data?.apartments) {
				const mapped = response.data.apartments.map((apt, index) => ({
					id: apt._id, // apartment ID
					sn: index + 1,
					apartmentName: apt.apartmentName,
					apartmentAddress: `${apt.address}, ${apt.city}, ${apt.state}`,
					agentName: `${apt.agentId.firstName} ${apt.agentId.lastName}`,
					agentEmail: apt.agentId.email,
					agentPhone: `+${apt.agentId.phone}`,
					status: apt.status,
				}));
				setApartments(mapped);
			} else {
				throw new Error("Failed to fetch apartments");
			}
		} catch (error) {
			console.error("Error fetching apartments:", error);
			toast({
				title: "Error",
				description: error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = async (apartmentId, action) => {
		setStatusLoadingId(apartmentId);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			const endpoint =
				action === "approve"
					? AdminApprovedApartment(apartmentId)
					: AdminRejectApartment(apartmentId);

			await axios.patch(endpoint, null, {
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});

			toast({
				title: `Apartment ${action === "approve" ? "approved" : "rejected"}`,
				status: "success",
				duration: 4000,
				isClosable: true,
			});

			// Refetch updated list
			fetchPendingApartments();
		} catch (error) {
			console.error(`Error trying to ${action} apartment:`, error);
			toast({
				title: "Error",
				description: error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setStatusLoadingId(null);
		}
	};

	useEffect(() => {
		fetchPendingApartments();
	}, []);

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<Spinner size="xl" />
				</Flex>
			) : (
				<Tabs isFitted variant="enclosed">
					<Card p="16px" mt="20px" w="100%">
						<CardHeader>
							<Flex justify="space-between" align="center" minHeight="60px" w="100%">
								<Text fontSize="lg" color={"#de9301"} fontWeight="bold">
									Incoming Apartments
								</Text>
							</Flex>
						</CardHeader>

						<Card display="block">
							<DataTable
								value={apartments}
								paginator
								rows={5}
								rowsPerPageOptions={[5, 10, 25, 50]}
							>
								<Column field="sn" header="S/N" style={{ width: "5%" }} />
								<Column field="apartmentName" header="Apartment Name" sortable filter />
								<Column field="apartmentAddress" header="Address" sortable filter />
								<Column field="agentName" header="Agent Name" sortable filter />
								<Column field="agentEmail" header="Agent Email" sortable filter />
								<Column field="agentPhone" header="Phone No." sortable filter />
								<Column
									field="status"
									header="Status"
									body={(row) => (
										<span style={{ textTransform: "capitalize" }}>{row.status}</span>
									)}
								/>
								<Column
									header="Actions"
									body={(row) => (
										<HStack spacing={2}>
											<Button
												colorScheme="green"
												size="sm"
												isLoading={statusLoadingId === row.id}
												onClick={() => handleStatusChange(row.id, "approve")}
											>
												Approve
											</Button>
											<Button
												colorScheme="red"
												size="sm"
												variant="outline"
												isLoading={statusLoadingId === row.id}
												onClick={() => handleStatusChange(row.id, "reject")}
											>
												Reject
											</Button>
										</HStack>
									)}
								/>
							</DataTable>
						</Card>
					</Card>
				</Tabs>
			)}
		</Flex>
	);
};

export default Index;
