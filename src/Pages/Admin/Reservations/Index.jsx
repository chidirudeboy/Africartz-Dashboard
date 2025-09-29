import { useState, useEffect, useCallback, Fragment } from 'react';
import {
	Box,
	Text,
	VStack,
	HStack,
	Select,
	Input,
	Badge,
	Spinner,
	Alert,
	AlertIcon,
	SimpleGrid,
	InputGroup,
	InputLeftElement,
	Icon,
	Flex,
	useToast,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	Avatar
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { AdminGetAllReservationsAPI } from '../../../Endpoints';

const ReservationsIndex = () => {
	const [reservations, setReservations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		page: 1,
		limit: 20,
		status: '',
		startDate: '',
		endDate: '',
		search: ''
	});
	const [pagination, setPagination] = useState({
		page: 1,
		pages: 1,
		total: 0
	});
	const toast = useToast();

	const fetchAllReservations = useCallback(async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('authToken');

			const queryParams = new URLSearchParams();
			Object.entries(filters).forEach(([key, value]) => {
				if (value) queryParams.append(key, value);
			});

			const response = await fetch(`${AdminGetAllReservationsAPI}?${queryParams}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch reservations');
			}

			const data = await response.json();
			setReservations(data.data?.reservations || []);
			setPagination(data.data?.pagination || { page: 1, pages: 1, total: 0 });
		} catch (err) {
			setError(err.message);
			toast({
				title: "Error",
				description: err.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	}, [filters, toast]);

	useEffect(() => {
		fetchAllReservations();
	}, [fetchAllReservations]);

	const handleFilterChange = (key, value) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
			page: 1
		}));
	};

	const getStatusColor = (status) => {
		const colors = {
			'pending': 'yellow',
			'accepted': 'green',
			'cancelled': 'red',
			'confirmed': 'blue',
			'completed': 'purple'
		};
		return colors[status] || 'gray';
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const getReservationType = (type) => {
		const types = {
			'normal': 'Normal',
			'emergency': 'Emergency',
			'extended': 'Extended'
		};
		return types[type] || type;
	};

	// Template functions for DataTable
	const guestTemplate = (rowData) => {
		return (
			<HStack spacing={3}>
				<Avatar size="sm" name={`${rowData.userFirstName} ${rowData.userLastName}`} />
				<VStack align="start" spacing={0}>
					<Text fontWeight="medium" fontSize="sm">
						{rowData.userFirstName} {rowData.userLastName}
					</Text>
					<Text fontSize="xs" color="gray.500">
						{rowData.userId?.email || 'N/A'}
					</Text>
				</VStack>
			</HStack>
		);
	};

	const apartmentTemplate = (rowData) => {
		return (
			<VStack align="start" spacing={1}>
				<Text fontSize="sm" fontWeight="medium">
					{rowData.apartmentName}
				</Text>
				<Text fontSize="xs" color="gray.500">
					{rowData.apartmentAddress}
				</Text>
				<Text fontSize="xs" color="gray.500">
					{rowData.apartmentState}
				</Text>
			</VStack>
		);
	};

	const agentTemplate = (rowData) => {
		return (
			<HStack spacing={2}>
				<Avatar size="xs" name={`${rowData.agentId?.firstName} ${rowData.agentId?.lastName}`} />
				<VStack align="start" spacing={0}>
					<Text fontSize="sm">
						{rowData.agentId?.firstName} {rowData.agentId?.lastName}
					</Text>
					<Text fontSize="xs" color="gray.500">
						{rowData.agentId?.email}
					</Text>
				</VStack>
			</HStack>
		);
	};

	const statusTemplate = (rowData) => {
		return (
			<Badge colorScheme={getStatusColor(rowData.status)} size="sm" borderRadius="full" px={3} py={1}>
				{rowData.status}
			</Badge>
		);
	};

	const typeTemplate = (rowData) => {
		const typeColors = {
			'normal': 'blue',
			'emergency': 'red',
			'extended': 'purple'
		};
		return (
			<Badge colorScheme={typeColors[rowData.reservationType] || 'gray'} variant="subtle" borderRadius="full" px={2} py={1}>
				{getReservationType(rowData.reservationType)}
			</Badge>
		);
	};

	const idTemplate = (rowData) => {
		return (
			<Text fontSize="sm" fontFamily="mono" color="gray.600">
				{rowData._id ? rowData._id.slice(-8) : 'N/A'}
			</Text>
		);
	};

	// Calculate statistics
	const totalReservations = pagination.total;
	const pendingReservations = reservations.filter(r => r.status === 'pending').length;
	const confirmedReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'accepted').length;
	const completedReservations = reservations.filter(r => r.status === 'completed').length;

	if (loading && (!reservations || reservations.length === 0)) {
		return (
			<Flex justify="center" align="center" h="30rem" w="100%">
				<VStack spacing={4}>
					<Spinner size="xl" />
					<Text>Loading reservations...</Text>
				</VStack>
			</Flex>
		);
	}

	if (error) {
		return (
			<Box p={6} pt={20}>
				<Alert status="error">
					<AlertIcon />
					{error}
				</Alert>
			</Box>
		);
	}

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<Spinner size="xl" />
				</Flex>
			) : (
				<Fragment>
					{/* Statistics Cards */}
					<SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px" mb="30px">
						<Card p="20px" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Total Reservations</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{totalReservations}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>All bookings</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Pending</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{pendingReservations}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Awaiting approval</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Confirmed</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{confirmedReservations}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Active bookings</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Completed</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{completedReservations}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Finished stays</StatHelpText>
							</Stat>
						</Card>
					</SimpleGrid>

					{/* Filters Card */}
					<Card p="24px" mb="24px" boxShadow="lg" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<VStack align="start" spacing={1}>
								<Text fontSize="xl" fontWeight="bold" color="gray.800">
									Filters & Search
								</Text>
								<Text fontSize="md" color="gray.500">
									Filter reservations by status, dates, and search criteria
								</Text>
							</VStack>
						</CardHeader>
						<CardBody>
							<SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
								<Box>
									<Text fontSize="sm" mb={2} fontWeight="medium">Search</Text>
									<InputGroup>
										<InputLeftElement pointerEvents="none">
											<Icon as={FaSearch} color="gray.400" />
										</InputLeftElement>
										<Input
											placeholder="Search by name, email, apartment..."
											value={filters.search}
											onChange={(e) => handleFilterChange('search', e.target.value)}
											borderRadius="lg"
										/>
									</InputGroup>
								</Box>

								<Box>
									<Text fontSize="sm" mb={2} fontWeight="medium">Status</Text>
									<Select
										placeholder="All Statuses"
										value={filters.status}
										onChange={(e) => handleFilterChange('status', e.target.value)}
										borderRadius="lg"
									>
										<option value="pending">Pending</option>
										<option value="accepted">Accepted</option>
										<option value="cancelled">Cancelled</option>
										<option value="confirmed">Confirmed</option>
										<option value="completed">Completed</option>
									</Select>
								</Box>

								<Box>
									<Text fontSize="sm" mb={2} fontWeight="medium">Check-in From</Text>
									<Input
										type="date"
										value={filters.startDate}
										onChange={(e) => handleFilterChange('startDate', e.target.value)}
										borderRadius="lg"
									/>
								</Box>

								<Box>
									<Text fontSize="sm" mb={2} fontWeight="medium">Check-in To</Text>
									<Input
										type="date"
										value={filters.endDate}
										onChange={(e) => handleFilterChange('endDate', e.target.value)}
										borderRadius="lg"
									/>
								</Box>

								<Box>
									<Text fontSize="sm" mb={2} fontWeight="medium">Results per page</Text>
									<Select
										value={filters.limit}
										onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
										borderRadius="lg"
									>
										<option value={10}>10</option>
										<option value={20}>20</option>
										<option value={50}>50</option>
										<option value={100}>100</option>
									</Select>
								</Box>
							</SimpleGrid>
						</CardBody>
					</Card>

					{/* Main Table Card */}
					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<Flex justify="space-between" align="center" w="100%">
								<VStack align="start" spacing={1}>
									<Text fontSize="2xl" fontWeight="bold" color="gray.800">
										Reservations Management
									</Text>
									<Text fontSize="md" color="gray.500">
										Monitor and manage all platform reservations
									</Text>
								</VStack>
								<HStack>
									<Text fontSize="sm" color="gray.500">
										Showing {((pagination.page - 1) * filters.limit) + 1} to{' '}
										{Math.min(pagination.page * filters.limit, pagination.total)} of{' '}
										{pagination.total} reservations
									</Text>
								</HStack>
							</Flex>
						</CardHeader>

						<CardBody display={"block"}>
							<Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
								<DataTable
									value={reservations}
									paginator
									rows={filters.limit}
									rowsPerPageOptions={[10, 20, 50, 100]}
									emptyMessage="No reservations found. Try adjusting your filters."
									loading={loading}
									stripedRows
									rowHover
									scrollable
									scrollHeight="600px"
									first={(pagination.page - 1) * filters.limit}
									totalRecords={pagination.total}
									lazy
								>
									<Column
										field="_id"
										header="ID"
										body={idTemplate}
										style={{ width: "8%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										field="userFirstName"
										header="Guest"
										body={guestTemplate}
										style={{ width: "20%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										field="apartmentName"
										header="Apartment"
										body={apartmentTemplate}
										style={{ width: "25%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										field="agentId.firstName"
										header="Agent"
										body={agentTemplate}
										style={{ width: "15%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										field="checkInDate"
										header="Check-in"
										body={(row) => (
											<Text fontSize="sm" color="gray.600">
												{row.checkInDate ? formatDate(row.checkInDate) : 'N/A'}
											</Text>
										)}
										style={{ width: "10%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										field="checkOutDate"
										header="Check-out"
										body={(row) => (
											<Text fontSize="sm" color="gray.600">
												{row.checkOutDate ? formatDate(row.checkOutDate) : 'N/A'}
											</Text>
										)}
										style={{ width: "10%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										field="reservationType"
										header="Type"
										body={typeTemplate}
										style={{ width: "8%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									></Column>

									<Column
										field="status"
										header="Status"
										body={statusTemplate}
										style={{ width: "10%", padding: "16px" }}
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

export default ReservationsIndex;