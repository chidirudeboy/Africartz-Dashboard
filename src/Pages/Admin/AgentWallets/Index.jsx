import { Fragment, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Flex, SimpleGrid, Spinner, Text, useToast, Box, Stat, StatLabel, StatNumber, StatHelpText, Badge, Avatar, HStack, VStack, Input, InputGroup, InputLeftElement, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { AdminGetAgentWalletHistoryAPI, AdminGetAgentWalletsAPI } from "../../../Endpoints";
import GlobalContext from "../../../Context";
import { formatPhoneNumber } from "../../../utils/phone";

const AgentWallets = () => {
	const [loading, setLoading] = useState(false);
	const [wallets, setWallets] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [historyModalOpen, setHistoryModalOpen] = useState(false);
	const [selectedWallet, setSelectedWallet] = useState(null);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [walletHistory, setWalletHistory] = useState([]);
	const [walletHistoryMeta, setWalletHistoryMeta] = useState(null);
	const toast = useToast();
	const { handleTokenExpired } = useContext(GlobalContext);

	const fetchAgentWallets = useCallback(async () => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) {
				throw new Error("No authentication token found");
			}

			const response = await axios.get(AdminGetAgentWalletsAPI, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (response.data.status === "success") {
				setWallets(response.data.data || []);
			} else {
				throw new Error(response.data.message || "Failed to fetch agent wallets");
			}
		} catch (error) {
			console.error("Error fetching agent wallets:", error);
			toast({
				title: "Error",
				description: error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});

			if (error.response?.status === 401) {
				handleTokenExpired();
			}
		} finally {
			setLoading(false);
		}
	}, [handleTokenExpired, toast]);

	useEffect(() => {
		fetchAgentWallets();
	}, [fetchAgentWallets]);

	const sortedWallets = useMemo(() => {
		return [...wallets]
			.map((wallet, index) => ({
				...wallet,
				sn: index + 1,
				fullName: `${wallet.firstName || ""} ${wallet.lastName || ""}`.trim(),
			}))
			.sort((a, b) => (b.balance || 0) - (a.balance || 0));
	}, [wallets]);

	const totalWalletBalance = sortedWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
	const highestWalletBalance = sortedWallets[0]?.balance || 0;
	const averageWalletBalance = sortedWallets.length > 0 ? totalWalletBalance / sortedWallets.length : 0;

	const formatCurrency = (value) => `₦${Number(value || 0).toLocaleString()}`;

	const formatDate = (dateString, withTime = false) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleString(undefined, withTime ? {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		} : {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const fetchWalletHistory = useCallback(async (agentId) => {
		setHistoryLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) {
				throw new Error("No authentication token found");
			}

			const response = await axios.get(AdminGetAgentWalletHistoryAPI(agentId), {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (response.data.status === "success") {
				setWalletHistory(response.data.data?.transactions || []);
				setWalletHistoryMeta(response.data.data || null);
			} else {
				throw new Error(response.data.message || "Failed to fetch wallet history");
			}
		} catch (error) {
			console.error("Error fetching wallet history:", error);
			toast({
				title: "Error",
				description: error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});

			if (error.response?.status === 401) {
				handleTokenExpired();
			}
		} finally {
			setHistoryLoading(false);
		}
	}, [handleTokenExpired, toast]);

	const openHistoryModal = async (wallet) => {
		setSelectedWallet(wallet);
		setWalletHistory([]);
		setWalletHistoryMeta(null);
		setHistoryModalOpen(true);
		await fetchWalletHistory(wallet.agentId);
	};

	const closeHistoryModal = () => {
		if (historyLoading) return;
		setHistoryModalOpen(false);
		setSelectedWallet(null);
		setWalletHistory([]);
		setWalletHistoryMeta(null);
	};

	const agentTemplate = (rowData) => (
		<HStack spacing={3}>
			<Avatar size="sm" name={rowData.fullName} />
			<VStack align="start" spacing={0}>
				<Text fontWeight="medium">{rowData.fullName || "Unnamed Agent"}</Text>
				<Text fontSize="sm" color="gray.500">{rowData.email}</Text>
			</VStack>
		</HStack>
	);

	const statusTemplate = (rowData) => {
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

	const balanceTemplate = (rowData) => (
		<Text fontSize="sm" fontWeight="bold" color="green.600">
			{formatCurrency(rowData.balance)}
		</Text>
	);

	const phoneTemplate = (rowData) => (
		<Text fontSize="sm" color="gray.700" whiteSpace="nowrap">
			{formatPhoneNumber(rowData.phone)}
		</Text>
	);

	const transactionTypeTemplate = (rowData) => (
		<Badge colorScheme={rowData.type === "credit" ? "green" : "red"} variant="subtle" borderRadius="full" px={3} py={1} textTransform="capitalize">
			{rowData.type}
		</Badge>
	);

	const historyActionTemplate = (rowData) => (
		<Button size="sm" colorScheme="blue" variant="outline" onClick={() => openHistoryModal(rowData)}>
			View History
		</Button>
	);

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
								<StatLabel fontSize="md" opacity={0.8}>Agents With Balance</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{sortedWallets.length}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Wallets above zero</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Total Wallet Value</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{formatCurrency(totalWalletBalance)}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Across funded wallets</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Average Balance</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{formatCurrency(averageWalletBalance)}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Per funded wallet</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #f6ad55 0%, #dd6b20 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Highest Balance</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{formatCurrency(highestWalletBalance)}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Top wallet</StatHelpText>
							</Stat>
						</Card>
					</SimpleGrid>

					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<Flex justify="space-between" align="center" w="100%">
								<VStack align="start" spacing={1}>
									<Text fontSize="2xl" fontWeight="bold" color="gray.800">
										Agent Wallet Balances
									</Text>
									<Text fontSize="md" color="gray.500">
										Finance overview of agents with available wallet balances
									</Text>
								</VStack>
							</Flex>
						</CardHeader>

						<CardBody display={"block"}>
							<Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
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
										/>
									</InputGroup>
								</Box>

								<DataTable
									value={sortedWallets}
									paginator
									rows={10}
									rowsPerPageOptions={[5, 10, 25, 50]}
									emptyMessage="No funded agent wallets found."
									loading={loading}
									stripedRows
									rowHover
									scrollable
									scrollHeight="600px"
									globalFilter={globalFilter}
									filterDisplay="row"
								>
									<Column field="sn" header="S/N" style={{ width: "6%", padding: "16px" }} headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }} />
									<Column field="fullName" header="Agent" body={agentTemplate} sortable filter filterPlaceholder="Search by name" style={{ width: "25%", padding: "16px" }} headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }} />
									<Column field="phone" header="Phone" body={phoneTemplate} sortable filter filterPlaceholder="Search by phone" style={{ minWidth: "170px", padding: "16px" }} headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }} />
									<Column field="status" header="Status" body={statusTemplate} sortable filter filterPlaceholder="Search by status" style={{ width: "14%", padding: "16px" }} headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }} />
									<Column field="balance" header="Wallet Balance" body={balanceTemplate} sortable style={{ width: "18%", padding: "16px" }} headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }} />
									<Column field="updatedAt" header="Last Updated" body={(row) => <Text fontSize="sm" color="gray.600">{formatDate(row.updatedAt)}</Text>} sortable style={{ width: "16%", padding: "16px" }} headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }} />
									<Column header="History" body={historyActionTemplate} style={{ width: "12%", padding: "16px" }} headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }} />
								</DataTable>
							</Box>
						</CardBody>
					</Card>

					<Modal isOpen={historyModalOpen} onClose={closeHistoryModal} size="6xl" scrollBehavior="inside">
						<ModalOverlay />
						<ModalContent>
							<ModalHeader>
								Wallet History {selectedWallet?.fullName ? `- ${selectedWallet.fullName}` : ""}
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody>
								<VStack align="stretch" spacing={4}>
									<Box>
										<Text fontSize="sm" color="gray.500">
											Current balance
										</Text>
										<Text fontSize="2xl" fontWeight="bold" color="green.600">
											{formatCurrency(walletHistoryMeta?.wallet?.balance || selectedWallet?.balance || 0)}
										</Text>
									</Box>

									{historyLoading ? (
										<Flex justify="center" align="center" py={10}>
											<Spinner size="lg" />
										</Flex>
									) : (
										<DataTable
											value={walletHistory}
											paginator
											rows={10}
											rowsPerPageOptions={[5, 10, 25, 50]}
											emptyMessage="No wallet transactions found."
											stripedRows
											rowHover
											scrollable
											scrollHeight="420px"
										>
											<Column field="type" header="Type" body={transactionTypeTemplate} style={{ minWidth: "120px" }} />
											<Column field="amount" header="Amount" body={(row) => <Text fontWeight="semibold">{formatCurrency(row.amount)}</Text>} style={{ minWidth: "140px" }} />
											<Column field="balanceBefore" header="Before" body={(row) => <Text>{formatCurrency(row.balanceBefore)}</Text>} style={{ minWidth: "140px" }} />
											<Column field="balanceAfter" header="After" body={(row) => <Text>{formatCurrency(row.balanceAfter)}</Text>} style={{ minWidth: "140px" }} />
											<Column field="reason" header="Reason" body={(row) => <Text fontSize="sm">{row.reason || "N/A"}</Text>} style={{ minWidth: "220px" }} />
											<Column field="reference" header="Reference" body={(row) => <Text fontSize="xs" fontFamily="mono">{row.reference}</Text>} style={{ minWidth: "200px" }} />
											<Column field="adminId" header="Admin" body={(row) => <Text fontSize="sm">{row.adminId?.email || `${row.adminId?.firstName || ""} ${row.adminId?.lastName || ""}`.trim() || "N/A"}</Text>} style={{ minWidth: "180px" }} />
											<Column field="createdAt" header="Date" body={(row) => <Text fontSize="sm">{formatDate(row.createdAt, true)}</Text>} sortable style={{ minWidth: "180px" }} />
										</DataTable>
									)}
								</VStack>
							</ModalBody>
							<ModalFooter>
								<Button onClick={closeHistoryModal}>Close</Button>
							</ModalFooter>
						</ModalContent>
					</Modal>
				</Fragment>
			)}
		</Flex>
	);
};

export default AgentWallets;
