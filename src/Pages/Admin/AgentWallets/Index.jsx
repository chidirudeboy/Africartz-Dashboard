import { Fragment, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Flex, SimpleGrid, Spinner, Text, useToast, Box, Stat, StatLabel, StatNumber, StatHelpText, Badge, Avatar, HStack, VStack, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { AdminGetAgentWalletsAPI } from "../../../Endpoints";
import GlobalContext from "../../../Context";
import { formatPhoneNumber } from "../../../utils/phone";

const AgentWallets = () => {
	const [loading, setLoading] = useState(false);
	const [wallets, setWallets] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
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

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
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
								</DataTable>
							</Box>
						</CardBody>
					</Card>
				</Fragment>
			)}
		</Flex>
	);
};

export default AgentWallets;
