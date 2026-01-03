import { Fragment, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Flex, SimpleGrid, Spinner, Text, useToast, Box, Stat, StatLabel, StatNumber, StatHelpText, Badge, Avatar, HStack, VStack, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { AdminGetAgentAPI } from "../../../Endpoints";
import GlobalContext from "../../../Context";
import { SearchIcon } from "@chakra-ui/icons";

const AgentsTable = () => {
	const [loading, setLoading] = useState(false);
	const [totalAgents, setTotalAgents] = useState(0);
	const [agents, setAgents] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const toast = useToast();
	const { handleTokenExpired } = useContext(GlobalContext);

	const fetchAgents = useCallback(async () => {
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
				handleTokenExpired();
				return;
			}
		} finally {
			setLoading(false);
		}
	}, [handleTokenExpired, toast]);

	useEffect(() => {
		fetchAgents();
	}, [fetchAgents]);

	// Sort agents alphabetically by full name and add computed fullName field for filtering
	const sortedAgents = useMemo(() => {
		return [...agents]
			.map(agent => ({
				...agent,
				fullName: `${agent.firstName} ${agent.lastName}`
			}))
			.sort((a, b) => {
				const nameA = a.fullName.toLowerCase();
				const nameB = b.fullName.toLowerCase();
				return nameA.localeCompare(nameB);
			});
	}, [agents]);

	// Format date to readable format
	const formatDate = (dateString) => {
		const options = { year: 'numeric', month: 'short', day: 'numeric' };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	// Combine first and last name with avatar
	const fullNameTemplate = (rowData) => {
		return (
			<HStack spacing={3}>
				<Avatar size="sm" name={`${rowData.firstName} ${rowData.lastName}`} />
				<VStack align="start" spacing={0}>
					<Text fontWeight="medium">{`${rowData.firstName} ${rowData.lastName}`}</Text>
					<Text fontSize="sm" color="gray.500">Agent</Text>
				</VStack>
			</HStack>
		);
	};

	// Custom sort function for full name
	const fullNameSortFunction = (event) => {
		const sorted = [...event.data].sort((a, b) => {
			const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
			const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
			return event.order === 1 
				? nameA.localeCompare(nameB)
				: nameB.localeCompare(nameA);
		});
		return sorted;
	};

	// Filter header component
	const filterHeader = (
		<Box mb={4}>
			<InputGroup>
				<InputLeftElement pointerEvents="none">
					<SearchIcon color="gray.400" />
				</InputLeftElement>
				<Input
					placeholder="Search by name, email, or phone..."
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
					borderRadius="md"
					border="1px solid"
					borderColor="gray.300"
					_focus={{
						borderColor: "blue.500",
						boxShadow: "0 0 0 1px blue.500"
					}}
				/>
			</InputGroup>
		</Box>
	);

	// Format apartment count with badge
	const apartmentCountTemplate = (rowData) => {
		return (
			<Badge
				colorScheme={rowData.apartmentCount > 0 ? "green" : "gray"}
				variant="subtle"
				borderRadius="full"
				px={3}
				py={1}
			>
				{rowData.apartmentCount}
			</Badge>
		);
	};

	// Format imported apartments with badge
	const importedApartmentsTemplate = (rowData) => {
		return (
			<Badge
				colorScheme={rowData.importedApartments > 0 ? "blue" : "gray"}
				variant="subtle"
				borderRadius="full"
				px={3}
				py={1}
			>
				{rowData.importedApartments}
			</Badge>
		);
	};

	// Calculate statistics
	const totalApartments = agents.reduce((sum, agent) => sum + agent.apartmentCount, 0);
	const totalImported = agents.reduce((sum, agent) => sum + agent.importedApartments, 0);
	const activeAgents = agents.filter(agent => agent.apartmentCount > 0).length;

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
								<StatLabel fontSize="md" opacity={0.8}>Total Agents</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{totalAgents}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Registered users</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Active Agents</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{activeAgents}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>With apartments</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Total Apartments</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{totalApartments}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>All listings</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Imported</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{totalImported}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Import listings</StatHelpText>
							</Stat>
						</Card>
					</SimpleGrid>

					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<Flex justify="space-between" align="center" w="100%">
								<VStack align="start" spacing={1}>
									<Text fontSize="2xl" fontWeight="bold" color="gray.800">
										Agents Management
									</Text>
									<Text fontSize="md" color="gray.500">
										Manage and monitor all registered agents
									</Text>
								</VStack>
							</Flex>
						</CardHeader>

						<CardBody display={"block"}>
							<Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
								{filterHeader}
								<DataTable
									value={sortedAgents}
									paginator
									rows={10}
									rowsPerPageOptions={[5, 10, 25, 50]}
									emptyMessage="No agents found. Try again later."
									loading={loading}
									stripedRows
									rowHover
									scrollable
									scrollHeight="500px"
									globalFilter={globalFilter}
									filterDisplay="row"
								>
									<Column
										sortable
										sortFunction={fullNameSortFunction}
										field="fullName"
										header="Agent"
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
										style={{ width: "25%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
										filter
										filterPlaceholder="Search by email"
									></Column>

									<Column
										sortable
										field="phone"
										header="Phone"
										style={{ width: "15%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
										filter
										filterPlaceholder="Search by phone"
									></Column>

									<Column
										sortable
										field="apartmentCount"
										header="Apartments"
										body={apartmentCountTemplate}
										style={{ width: "10%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										sortable
										field="importedApartments"
										header="Imported"
										body={importedApartmentsTemplate}
										style={{ width: "10%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
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
										style={{ width: "15%", padding: "16px" }}
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

export default AgentsTable;