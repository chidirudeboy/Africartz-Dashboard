import { Fragment, useState, useEffect, useContext, useCallback } from "react";
import { Flex, SimpleGrid, Spinner, Text, useToast, Box, Stat, StatLabel, StatNumber, StatHelpText, Badge, Avatar, HStack, VStack } from "@chakra-ui/react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { numberWithCommas } from "../../../utils/index.js";
import { AdminGetUsersAPI } from "../../../Endpoints";
import GlobalContext from "../../../Context";

const UsersTable = () => {
	const [loading, setLoading] = useState(false);
	const [totalUsers, setTotalUsers] = useState(0);
	const [users, setUsers] = useState([]);
	const toast = useToast();
	const { handleTokenExpired } = useContext(GlobalContext);

	const fetchUsers = useCallback(async () => {
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
				handleTokenExpired();
				return;
			}
		} finally {
			setLoading(false);
		}
	}, [handleTokenExpired, toast]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	// Format date to readable format
	const formatDate = (dateString) => {
		const options = { year: 'numeric', month: 'short', day: 'numeric' };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	// Combine first and last name with avatar
	const fullNameTemplate = (rowData) => {
		return (
			<HStack spacing={3}>
				<Avatar size="sm" name={`${rowData.first_name} ${rowData.last_name}`} />
				<VStack align="start" spacing={0}>
					<Text fontWeight="medium">{`${rowData.first_name} ${rowData.last_name}`}</Text>
					<Text fontSize="sm" color="gray.500">User</Text>
				</VStack>
			</HStack>
		);
	};

	// Format email with better styling
	const emailTemplate = (rowData) => {
		return (
			<Text fontSize="sm" color="gray.700">
				{rowData.email}
			</Text>
		);
	};

	// Format phone with better styling
	const phoneTemplate = (rowData) => {
		return (
			<Badge
				colorScheme="blue"
				variant="subtle"
				borderRadius="full"
				px={3}
				py={1}
			>
				{rowData.phone}
			</Badge>
		);
	};

	// Calculate statistics
	const recentUsers = users.filter(user => {
		const userDate = new Date(user.createdAt);
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		return userDate >= thirtyDaysAgo;
	}).length;

	const thisWeekUsers = users.filter(user => {
		const userDate = new Date(user.createdAt);
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		return userDate >= sevenDaysAgo;
	}).length;

	const todayUsers = users.filter(user => {
		const userDate = new Date(user.createdAt);
		const today = new Date();
		return userDate.toDateString() === today.toDateString();
	}).length;

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<Spinner size="xl" />
				</Flex>
			) : (
				<Fragment>
					<SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px" mb="30px">
						<Card p="20px" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Total Users</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{numberWithCommas(totalUsers)}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>All registered users</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>New This Month</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{recentUsers}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Last 30 days</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>This Week</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{thisWeekUsers}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Last 7 days</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Today</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{todayUsers}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>New registrations</StatHelpText>
							</Stat>
						</Card>
					</SimpleGrid>

					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<Flex justify="space-between" align="center" w="100%">
								<VStack align="start" spacing={1}>
									<Text fontSize="2xl" fontWeight="bold" color="gray.800">
										Users Management
									</Text>
									<Text fontSize="md" color="gray.500">
										Manage and monitor all registered users
									</Text>
								</VStack>
							</Flex>
						</CardHeader>

						<CardBody display={"block"}>
							<Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
								<DataTable
									value={users}
									paginator
									rows={10}
									rowsPerPageOptions={[5, 10, 25, 50]}
									emptyMessage="No users found. Try again later."
									loading={loading}
									stripedRows
									rowHover
									scrollable
									scrollHeight="500px"
									globalFilterFields={['first_name', 'last_name', 'email', 'phone']}
								>
									<Column
										sortable
										field="first_name"
										header="User"
										body={fullNameTemplate}
										style={{ width: "30%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
										filter
										filterPlaceholder="Search by name"
									></Column>

									<Column
										sortable
										field="email"
										header="Email"
										body={emailTemplate}
										style={{ width: "30%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
										filter
										filterPlaceholder="Search by email"
									></Column>

									<Column
										sortable
										field="phone"
										header="Phone"
										body={phoneTemplate}
										style={{ width: "20%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
										filter
										filterPlaceholder="Search by phone"
									></Column>

									<Column
										sortable
										field="createdAt"
										header="Joined"
										body={(row) => (
											<Text fontSize="sm" color="gray.600">
												{formatDate(row.createdAt)}
											</Text>
										)}
										style={{ width: "20%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>
								</DataTable>
							</Box>
						</CardBody>
					</Card>
				</Fragment>
			)}
		</Flex>
	);
};

export default UsersTable;