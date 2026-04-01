import { Fragment, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Flex, SimpleGrid, Spinner, Text, useToast, Box, Stat, StatLabel, StatNumber, StatHelpText, Badge, Avatar, HStack, VStack, Input, InputGroup, InputLeftElement, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Textarea, FormControl, FormLabel, useDisclosure } from "@chakra-ui/react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { AdminChangeAgentStatusAPI, AdminGetAgentAPI } from "../../../Endpoints";
import GlobalContext from "../../../Context";
import { SearchIcon } from "@chakra-ui/icons";
import { formatPhoneNumber } from "../../../utils/phone";

const AgentsTable = () => {
	const [loading, setLoading] = useState(false);
	const [totalAgents, setTotalAgents] = useState(0);
	const [agents, setAgents] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedAgent, setSelectedAgent] = useState(null);
	const [statusReason, setStatusReason] = useState("");
	const [statusActionLoading, setStatusActionLoading] = useState(false);
	const toast = useToast();
	const { handleTokenExpired } = useContext(GlobalContext);
	const { isOpen, onOpen, onClose } = useDisclosure();

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
		const filteredAgents = statusFilter === "all"
			? agents
			: agents.filter((agent) => (agent.status || "active").toLowerCase() === statusFilter);

		return [...filteredAgents]
			.map(agent => ({
				...agent,
				fullName: `${agent.firstName} ${agent.lastName}`
			}))
			.sort((a, b) => {
				const nameA = a.fullName.toLowerCase();
				const nameB = b.fullName.toLowerCase();
				return nameA.localeCompare(nameB);
			});
	}, [agents, statusFilter]);

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
			<HStack spacing={3} mt={4} flexWrap="wrap">
				<Button
					size="sm"
					variant={statusFilter === "all" ? "solid" : "outline"}
					colorScheme="blue"
					onClick={() => setStatusFilter("all")}
				>
					All Agents
				</Button>
				<Button
					size="sm"
					variant={statusFilter === "active" ? "solid" : "outline"}
					colorScheme="green"
					onClick={() => setStatusFilter("active")}
				>
					Active
				</Button>
				<Button
					size="sm"
					variant={statusFilter === "suspended" ? "solid" : "outline"}
					colorScheme="orange"
					onClick={() => setStatusFilter("suspended")}
				>
					Suspended
				</Button>
			</HStack>
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

	const statusBadgeTemplate = (rowData) => {
		const status = (rowData.status || "active").toLowerCase();
		const colorScheme = {
			active: "green",
			suspended: "orange",
			banned: "red",
			pending: "yellow",
			under_review: "purple",
		}[status] || "gray";

		return (
			<Badge colorScheme={colorScheme} variant="subtle" borderRadius="full" px={3} py={1} textTransform="capitalize">
				{status.replace("_", " ")}
			</Badge>
		);
	};

	const phoneTemplate = (rowData) => (
		<Text fontSize="sm" color="gray.700" whiteSpace="nowrap">
			{formatPhoneNumber(rowData.phone)}
		</Text>
	);

	const openStatusModal = (agent) => {
		setSelectedAgent(agent);
		setStatusReason("");
		onOpen();
	};

	const closeStatusModal = () => {
		setSelectedAgent(null);
		setStatusReason("");
		onClose();
	};

	const handleChangeStatus = async () => {
		if (!selectedAgent) return;

		if (!statusReason.trim()) {
			toast({
				title: "Reason required",
				description: "Please provide a reason for this status change.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const currentStatus = (selectedAgent.status || "active").toLowerCase();
		const nextStatus = currentStatus === "suspended" ? "active" : "suspended";

		setStatusActionLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");

			if (!authToken) {
				throw new Error("No authentication token found");
			}

			await axios.patch(
				AdminChangeAgentStatusAPI(selectedAgent._id),
				{
					status: nextStatus,
					reason: statusReason.trim(),
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
				}
			);

			toast({
				title: nextStatus === "suspended" ? "Agent suspended" : "Agent reactivated",
				description: `${selectedAgent.firstName} ${selectedAgent.lastName} is now ${nextStatus}.`,
				status: "success",
				duration: 4000,
				isClosable: true,
			});

			closeStatusModal();
			fetchAgents();
		} catch (error) {
			console.error("Error changing agent status:", error);
			toast({
				title: "Update failed",
				description: error.response?.data?.error || error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setStatusActionLoading(false);
		}
	};

	// Calculate statistics
	const totalApartments = agents.reduce((sum, agent) => sum + agent.apartmentCount, 0);
	const totalImported = agents.reduce((sum, agent) => sum + agent.importedApartments, 0);
	const activeAgents = agents.filter(agent => (agent.status || "").toLowerCase() === "active").length;
	const suspendedAgents = agents.filter(agent => (agent.status || "").toLowerCase() === "suspended").length;

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			<style>
				{`
					.agent-row-suspended {
						background-color: #fff7ed !important;
					}
					.agent-row-suspended td:first-child {
						border-left: 4px solid #dd6b20;
					}
				`}
			</style>
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

						<Card
							p="20px"
							bg={suspendedAgents > 0 ? "linear-gradient(135deg, #f6ad55 0%, #dd6b20 100%)" : "linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)"}
							color="white"
							cursor="pointer"
							onClick={() => setStatusFilter("suspended")}
						>
							<Stat>
								<StatLabel fontSize="md" opacity={0.9}>Suspended</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{suspendedAgents}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.8}>Click to filter</StatHelpText>
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
									rowClassName={(rowData) => ((rowData.status || "").toLowerCase() === "suspended" ? "agent-row-suspended" : "")}
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
										body={phoneTemplate}
										style={{ minWidth: "170px", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
										filter
										filterPlaceholder="Search by phone"
									></Column>

									<Column
										sortable
										field="status"
										header="Status"
										body={statusBadgeTemplate}
										style={{ width: "12%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
										filter
										filterPlaceholder="Search by status"
									></Column>

									<Column
										sortable
										field="apartmentCount"
										header="Apartments"
										body={apartmentCountTemplate}
										style={{ width: "9%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										sortable
										field="importedApartments"
										header="Imported"
										body={importedApartmentsTemplate}
										style={{ width: "9%", padding: "16px" }}
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

									<Column
										header="Actions"
										body={(rowData) => {
											const status = (rowData.status || "active").toLowerCase();
											if (status !== "active" && status !== "suspended") {
												return <Text fontSize="sm" color="gray.400">No action</Text>;
											}

											return (
												<Button
													size="sm"
													variant="outline"
													colorScheme={status === "suspended" ? "green" : "orange"}
													onClick={() => openStatusModal(rowData)}
												>
													{status === "suspended" ? "Reactivate" : "Suspend"}
												</Button>
											);
										}}
										style={{ width: "15%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>
								</DataTable>
							</Box>
						</CardBody>
					</Card>
				</Fragment>
			)}

			<Modal isOpen={isOpen} onClose={closeStatusModal} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						{(selectedAgent?.status || "").toLowerCase() === "suspended" ? "Reactivate Agent" : "Suspend Agent"}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Text mb={4} color="gray.600">
							{selectedAgent ? `${selectedAgent.firstName} ${selectedAgent.lastName}` : "This agent"} will be {(selectedAgent?.status || "").toLowerCase() === "suspended" ? "returned to active status" : "moved to suspended status"}.
						</Text>
						<FormControl isRequired>
							<FormLabel>Reason</FormLabel>
							<Textarea
								value={statusReason}
								onChange={(e) => setStatusReason(e.target.value)}
								placeholder="Add an internal note for this action"
								rows={4}
							/>
						</FormControl>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={closeStatusModal}>
							Cancel
						</Button>
						<Button
							colorScheme={(selectedAgent?.status || "").toLowerCase() === "suspended" ? "green" : "orange"}
							onClick={handleChangeStatus}
							isLoading={statusActionLoading}
						>
							{(selectedAgent?.status || "").toLowerCase() === "suspended" ? "Reactivate" : "Suspend"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default AgentsTable;
