import { Fragment, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Flex, SimpleGrid, Spinner, Text, useToast, Box, Stat, StatLabel, StatNumber, StatHelpText, Badge, Avatar, HStack, VStack, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Textarea, FormControl, FormLabel, useDisclosure } from "@chakra-ui/react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { numberWithCommas } from "../../../utils/index.js";
import { AdminChangeUserStatusAPI, AdminGetUsersAPI } from "../../../Endpoints";
import GlobalContext from "../../../Context";
import { formatPhoneNumber } from "../../../utils/phone";

const UsersTable = () => {
	const [loading, setLoading] = useState(false);
	const [totalUsers, setTotalUsers] = useState(0);
	const [users, setUsers] = useState([]);
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedUser, setSelectedUser] = useState(null);
	const [statusReason, setStatusReason] = useState("");
	const [statusActionLoading, setStatusActionLoading] = useState(false);
	const toast = useToast();
	const { handleTokenExpired } = useContext(GlobalContext);
	const { isOpen, onOpen, onClose } = useDisclosure();

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

	const filteredUsers = useMemo(() => {
		if (statusFilter === "all") {
			return users;
		}

		return users.filter((user) => (user.status || "active").toLowerCase() === statusFilter);
	}, [users, statusFilter]);

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
			<Text fontSize="sm" color="gray.700" whiteSpace="nowrap">
				{formatPhoneNumber(rowData.phone)}
			</Text>
		);
	};

	const statusBadgeTemplate = (rowData) => {
		const status = (rowData.status || "active").toLowerCase();
		const colorScheme = {
			active: "green",
			inactive: "orange",
			banned: "red",
		}[status] || "gray";

		return (
			<Badge
				colorScheme={colorScheme}
				variant="subtle"
				borderRadius="full"
				px={3}
				py={1}
				textTransform="capitalize"
			>
				{status}
			</Badge>
		);
	};

	const openStatusModal = (user) => {
		setSelectedUser(user);
		setStatusReason("");
		onOpen();
	};

	const closeStatusModal = () => {
		setSelectedUser(null);
		setStatusReason("");
		onClose();
	};

	const handleChangeStatus = async () => {
		if (!selectedUser) return;

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

		const currentStatus = (selectedUser.status || "active").toLowerCase();
		const nextStatus = currentStatus === "inactive" ? "active" : "inactive";

		setStatusActionLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");

			if (!authToken) {
				throw new Error("No authentication token found");
			}

			await axios.patch(
				AdminChangeUserStatusAPI(selectedUser._id),
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
				title: nextStatus === "inactive" ? "User suspended" : "User reactivated",
				description: `${selectedUser.first_name} ${selectedUser.last_name} is now ${nextStatus}.`,
				status: "success",
				duration: 4000,
				isClosable: true,
			});

			closeStatusModal();
			fetchUsers();
		} catch (error) {
			console.error("Error changing user status:", error);
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

	const activeUsers = users.filter((user) => (user.status || "").toLowerCase() === "active").length;
	const suspendedUsers = users.filter((user) => (user.status || "").toLowerCase() === "inactive").length;

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			<style>
				{`
					.user-row-suspended {
						background-color: #fff7ed !important;
					}
					.user-row-suspended td:first-child {
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
								<StatLabel fontSize="md" opacity={0.8}>Active Users</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{activeUsers}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Currently active</StatHelpText>
							</Stat>
						</Card>

						<Card
							p="20px"
							bg={suspendedUsers > 0 ? "linear-gradient(135deg, #f6ad55 0%, #dd6b20 100%)" : "linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)"}
							color="white"
							cursor="pointer"
							onClick={() => setStatusFilter("inactive")}
						>
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Suspended</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{suspendedUsers}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Click to filter</StatHelpText>
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
								<HStack spacing={3} mb={4} flexWrap="wrap" px={1} pt={1}>
									<Button
										size="sm"
										variant={statusFilter === "all" ? "solid" : "outline"}
										colorScheme="blue"
										onClick={() => setStatusFilter("all")}
									>
										All Users
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
										variant={statusFilter === "inactive" ? "solid" : "outline"}
										colorScheme="orange"
										onClick={() => setStatusFilter("inactive")}
									>
										Suspended
									</Button>
									<Text fontSize="sm" color="gray.500">
										Showing {filteredUsers.length} of {users.length}
									</Text>
								</HStack>
								<DataTable
									value={filteredUsers}
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
									rowClassName={(rowData) => ((rowData.status || "").toLowerCase() === "inactive" ? "user-row-suspended" : "")}
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
										style={{ width: "14%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
										filter
										filterPlaceholder="Search by status"
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
										style={{ width: "16%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										header="Actions"
										body={(rowData) => {
											const status = (rowData.status || "active").toLowerCase();
											if (status !== "active" && status !== "inactive") {
												return <Text fontSize="sm" color="gray.400">No action</Text>;
											}

											return (
												<Button
													size="sm"
													variant="outline"
													colorScheme={status === "inactive" ? "green" : "orange"}
													onClick={() => openStatusModal(rowData)}
												>
													{status === "inactive" ? "Reactivate" : "Suspend"}
												</Button>
											);
										}}
										style={{ width: "14%", padding: "16px" }}
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
						{(selectedUser?.status || "").toLowerCase() === "inactive" ? "Reactivate User" : "Suspend User"}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Text mb={4} color="gray.600">
							{selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "This user"} will be {(selectedUser?.status || "").toLowerCase() === "inactive" ? "returned to active status" : "moved to suspended status"}.
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
							colorScheme={(selectedUser?.status || "").toLowerCase() === "inactive" ? "green" : "orange"}
							onClick={handleChangeStatus}
							isLoading={statusActionLoading}
						>
							{(selectedUser?.status || "").toLowerCase() === "inactive" ? "Reactivate" : "Suspend"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default UsersTable;
