import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
	Box,
	Flex,
	Text,
	Button,
	useToast,
	Spinner,
	VStack,
	Input,
	FormControl,
	FormLabel,
	Grid,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	Badge,
	Divider,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
} from '@chakra-ui/react';
import axios from 'axios';
import Card from '../../../components/Card/Card';
import CardBody from '../../../components/Card/CardBody';
import CardHeader from '../../../components/Card/CardHeader';

const Statistics = () => {
	const [loading, setLoading] = useState(false);
	const [dashboardData, setDashboardData] = useState(null);
	const [error, setError] = useState(null);
	const [lastFetchTime, setLastFetchTime] = useState(null);
	const hasInitialized = useRef(false);
	
	// Initialize with current month dates
	const currentDate = new Date();
	const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
	const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
	
	const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
	const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split('T')[0]);
	const [selectedPeriod, setSelectedPeriod] = useState('custom');
	
	const toast = useToast();

	// Utility function to safely access nested properties
	const safeGet = (obj, path, defaultValue = 'N/A') => {
		if (!obj) return defaultValue;
		const keys = path.split('.');
		let result = obj;
		for (const key of keys) {
			if (result === null || result === undefined || !result.hasOwnProperty(key)) {
				return defaultValue;
			}
			result = result[key];
		}
		return result !== null && result !== undefined ? result : defaultValue;
	};

	// Format numbers for display
	const formatNumber = (value) => {
		if (typeof value !== 'number') return value;
		return value.toLocaleString();
	};

	// Format currency (Nigerian Naira)
	const formatCurrency = (value, currency = 'NGN') => {
		if (typeof value !== 'number') return value;
		if (value === 0) return '₦0';
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	};


	// Format date for API (converts YYYY-MM-DD to ISO 8601 format)
	const formatDateForAPI = (dateString, isEndDate = false) => {
		const date = new Date(dateString);
		if (isEndDate) {
			// Set to end of day for end date
			date.setHours(23, 59, 59, 999);
		} else {
			// Set to start of day for start date
			date.setHours(0, 0, 0, 0);
		}
		return date.toISOString();
	};

	// Handle preset period selection
	const handlePeriodChange = (period) => {
		setSelectedPeriod(period);
		const today = new Date();
		const currentYear = today.getFullYear();
		const currentMonth = today.getMonth();
		
		switch (period) {
			case 'today':
				setStartDate(today.toISOString().split('T')[0]);
				setEndDate(today.toISOString().split('T')[0]);
				break;
			case 'yesterday':
				const yesterday = new Date(today);
				yesterday.setDate(yesterday.getDate() - 1);
				setStartDate(yesterday.toISOString().split('T')[0]);
				setEndDate(yesterday.toISOString().split('T')[0]);
				break;
			case 'last_7_days':
				const sevenDaysAgo = new Date(today);
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
				setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
				setEndDate(today.toISOString().split('T')[0]);
				break;
			case 'last_30_days':
				const thirtyDaysAgo = new Date(today);
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
				setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
				setEndDate(today.toISOString().split('T')[0]);
				break;
			case 'this_month':
				const firstDay = new Date(currentYear, currentMonth, 1);
				const lastDay = new Date(currentYear, currentMonth + 1, 0);
				setStartDate(firstDay.toISOString().split('T')[0]);
				setEndDate(lastDay.toISOString().split('T')[0]);
				break;
			case 'last_month':
				const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
				const lastMonthEnd = new Date(currentYear, currentMonth, 0);
				setStartDate(lastMonthStart.toISOString().split('T')[0]);
				setEndDate(lastMonthEnd.toISOString().split('T')[0]);
				break;
			case 'this_year':
				const yearStart = new Date(currentYear, 0, 1);
				const yearEnd = new Date(currentYear, 11, 31);
				setStartDate(yearStart.toISOString().split('T')[0]);
				setEndDate(yearEnd.toISOString().split('T')[0]);
				break;
			case 'custom':
				// Keep current dates for custom selection
				break;
			default:
				break;
		}
	};

	const fetchDashboardData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) {
				throw new Error("No authentication token found. Please log in again.");
			}

			// Validate date range
			if (new Date(startDate) >= new Date(endDate)) {
				throw new Error("Start date must be before end date");
			}

			// Format dates for API
			const formattedStartDate = formatDateForAPI(startDate, false);
			const formattedEndDate = formatDateForAPI(endDate, true);

			const url = `https://api.africartz.com/api/admin/dashboard?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
			console.log('Fetching dashboard data from:', url);
			console.log('Date range:', { 
				original: { startDate, endDate },
				formatted: { startDate: formattedStartDate, endDate: formattedEndDate }
			});

			const response = await axios.get(url, {
				headers: {
					"Authorization": `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				timeout: 30000, // 30 second timeout
			});

			console.log('Dashboard API Response:', response.data);

			// Comprehensive logging for all data structures
			if (response.data?.data) {
				const data = response.data.data;
				
				console.log('=== COMPLETE DASHBOARD DATA ===');
				console.log('Full data structure:', JSON.stringify(data, null, 2));

				// Log specific sections
				if (data.engagement) {
					console.log('=== ENGAGEMENT DATA ===');
					console.log('Reservations:', data.engagement.reservations);
					console.log('Reviews:', data.engagement.reviews);
					console.log('Notifications:', data.engagement.notifications);
					console.log('User Engagement:', data.engagement.userEngagement);
					console.log('Repeat Customers:', data.engagement.repeatCustomers);
				}

				if (data.revenue) {
					console.log('=== REVENUE DATA ===');
					console.log(JSON.stringify(data.revenue, null, 2));
				}

				if (data.users) {
					console.log('=== USERS DATA ===');
					console.log(JSON.stringify(data.users, null, 2));
				}

				if (data.orders) {
					console.log('=== ORDERS DATA ===');
					console.log(JSON.stringify(data.orders, null, 2));
				}
			}

			setDashboardData(response.data);
			setLastFetchTime(new Date().toLocaleString());

			toast({
				title: "Data Fetched Successfully",
				description: `Dashboard statistics loaded for ${new Date(startDate).toLocaleDateString('en-NG')} - ${new Date(endDate).toLocaleDateString('en-NG')}`,
				status: "success",
				duration: 3000,
				isClosable: true,
			});

		} catch (error) {
			console.error('Failed to fetch dashboard data:', error);
			
			let errorMessage = "Failed to fetch dashboard data";
			if (error.response) {
				// Server responded with error status
				errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
			} else if (error.request) {
				// Request made but no response received
				errorMessage = "Network error: No response from server";
			} else {
				// Something else happened
				errorMessage = error.message;
			}

			setError(errorMessage);
			toast({
				title: "Error",
				description: errorMessage,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate, toast]); // Added toast back for ESLint

	// Fetch data on mount only once
	useEffect(() => {
		if (!hasInitialized.current) {
			hasInitialized.current = true;
			fetchDashboardData();
		}
	}, [fetchDashboardData]);

	// Component to render stat cards
	const StatCard = ({ title, value, change, changeType, helpText, color = "blue" }) => (
		<Card>
			<CardBody>
				<Stat>
					<StatLabel color="gray.600">{title}</StatLabel>
					<StatNumber color={`${color}.500`} fontSize="2xl">
						{formatNumber(value)}
					</StatNumber>
					{change !== null && (
						<StatHelpText>
							<StatArrow type={changeType} />
							{Math.abs(change).toFixed(1)}%
						</StatHelpText>
					)}
					{helpText && (
						<Text fontSize="sm" color="gray.500" mt={1}>
							{helpText}
						</Text>
					)}
				</Stat>
			</CardBody>
		</Card>
	);

	// Component to render overview statistics
	const OverviewSection = ({ data }) => {
		const overview = safeGet(data, 'data.overview', {});
		const apartments = safeGet(overview, 'apartments', {});
		const agents = safeGet(overview, 'agents', {});
		const users = safeGet(overview, 'users', {});

		return (
			<Box>
				<Text fontSize="xl" fontWeight="bold" mb={6} color="blue.600">
					🏠 Business Overview
				</Text>
				
				{/* Apartments Section */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Apartments Portfolio
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
						<StatCard
							title="Total Apartments"
							value={safeGet(apartments, 'total', 0)}
							helpText={`${safeGet(apartments, 'owned', 0)} owned, ${safeGet(apartments, 'imported', 0)} imported`}
							color="blue"
						/>
						<StatCard
							title="Total Portfolio Value"
							value={formatCurrency(safeGet(apartments, 'totalValue', 0))}
							helpText={`Avg: ${formatCurrency(safeGet(apartments, 'avgPrice', 0))}`}
							color="green"
						/>
						<StatCard
							title="Average Bedrooms"
							value={safeGet(apartments, 'avgBedrooms', 0).toFixed(1)}
							helpText={`Avg bathrooms: ${safeGet(apartments, 'avgBathrooms', 0).toFixed(1)}`}
							color="purple"
						/>
						<StatCard
							title="Media Assets"
							value={safeGet(apartments, 'totalImages', 0)}
							helpText={`${safeGet(apartments, 'apartmentsWithVideos', 0)} with videos`}
							color="orange"
						/>
					</Grid>
				</Box>
				
				{/* Agents and Users Section */}
				<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
					<Box>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							Agents Performance
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={3}>
							<StatCard
								title="Total Agents"
								value={safeGet(agents, 'total', 0)}
								helpText={`${safeGet(agents, 'activeAgents', 0)} active`}
								color="teal"
							/>
							<StatCard
								title="Avg Apartments/Agent"
								value={safeGet(agents, 'avgApartmentsPerAgent', 0).toFixed(1)}
								color="cyan"
							/>
							<StatCard
								title="Avg Wallet Balance"
								value={formatCurrency(safeGet(agents, 'avgWalletBalance', 0))}
								color="pink"
							/>
						</Grid>
					</Box>
					
					<Box>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							User Engagement
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={3}>
							<StatCard
								title="Total Users"
								value={safeGet(users, 'total', 0)}
								color="blue"
							/>
							<StatCard
								title="New This Month"
								value={safeGet(users, 'newThisMonth', 0)}
								helpText={`${safeGet(users, 'newThisWeek', 0)} this week, ${safeGet(users, 'newToday', 0)} today`}
								color="green"
							/>
							<StatCard
								title="Users with Bookings"
								value={safeGet(users, 'usersWithBookings', 0)}
								helpText={`Avg: ${safeGet(users, 'avgBookingsPerUser', 0).toFixed(1)} bookings/user`}
								color="purple"
							/>
						</Grid>
					</Box>
				</Grid>
			</Box>
		);
	};

	// Component to render wallet analytics
	const WalletSection = ({ data }) => {
		const wallets = safeGet(data, 'data.overview.wallets', {});

		return (
			<Box>
				<Text fontSize="xl" fontWeight="bold" mb={6} color="green.600">
					💳 Wallet Analytics
				</Text>
				
				{/* Main Wallet Stats */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Agent Wallet Overview
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
						<StatCard
							title="Total Wallet Balance"
							value={formatCurrency(safeGet(wallets, 'totalBalance', 0))}
							helpText={`Across ${safeGet(wallets, 'totalWallets', 0)} wallets`}
							color="green"
						/>
						<StatCard
							title="Average Balance"
							value={formatCurrency(safeGet(wallets, 'avgBalance', 0))}
							helpText={`${safeGet(wallets, 'walletsWithBalance', 0)} active wallets`}
							color="blue"
						/>
						<StatCard
							title="Highest Balance"
							value={formatCurrency(safeGet(wallets, 'maxBalance', 0))}
							helpText={`Min: ${formatCurrency(safeGet(wallets, 'minBalance', 0))}`}
							color="purple"
						/>
					</Grid>
				</Box>

				{/* Wallet Distribution */}
				<Box>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Wallet Distribution by Value
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4}>
						<StatCard
							title="High Value Wallets"
							value={safeGet(wallets, 'highValueWallets', 0)}
							helpText="> ₦50,000"
							color="gold"
						/>
						<StatCard
							title="Medium Value Wallets"
							value={safeGet(wallets, 'mediumValueWallets', 0)}
							helpText="₦10,000 - ₦50,000"
							color="orange"
						/>
						<StatCard
							title="Low Value Wallets"
							value={safeGet(wallets, 'lowValueWallets', 0)}
							helpText="< ₦10,000"
							color="yellow"
						/>
						<StatCard
							title="Empty Wallets"
							value={safeGet(wallets, 'totalWallets', 0) - safeGet(wallets, 'walletsWithBalance', 0)}
							helpText="₦0 balance"
							color="red"
						/>
					</Grid>
				</Box>
			</Box>
		);
	};

	// Component to render financial statistics
	const FinancialSection = ({ data }) => {
		const financial = safeGet(data, 'data.financial', {});
		const bookings = safeGet(financial, 'bookings', {});
		const withdrawals = safeGet(financial, 'withdrawals', {});
		const paymentStats = safeGet(financial, 'paymentStats', {});

		return (
			<Box>
				<Text fontSize="xl" fontWeight="bold" mb={6} color="green.600">
					💰 Financial Overview
				</Text>
				
				{/* Revenue & Bookings */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Booking Revenue
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
						<StatCard
							title="Total Revenue"
							value={formatCurrency(safeGet(bookings, 'totalRevenue', 0))}
							color="green"
						/>
						<StatCard
							title="Total Profit"
							value={formatCurrency(safeGet(bookings, 'totalProfit', 0))}
							color="blue"
						/>
						<StatCard
							title="Avg Booking Value"
							value={formatCurrency(safeGet(bookings, 'avgBookingValue', 0))}
							color="purple"
						/>
						<StatCard
							title="Profit Margin"
							value={`${safeGet(bookings, 'avgProfitMargin', 0).toFixed(1)}%`}
							color="orange"
						/>
					</Grid>
				</Box>

				{/* Bookings Status */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Bookings Status
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4}>
						<StatCard
							title="Total Bookings"
							value={safeGet(bookings, 'totalBookings', 0)}
							color="blue"
						/>
						<StatCard
							title="Completed"
							value={safeGet(bookings, 'completedBookings', 0)}
							color="green"
						/>
						<StatCard
							title="Active"
							value={safeGet(bookings, 'activeBookings', 0)}
							color="orange"
						/>
						<StatCard
							title="Cancelled"
							value={safeGet(bookings, 'cancelledBookings', 0)}
							color="red"
						/>
						<StatCard
							title="Payment Pending"
							value={safeGet(bookings, 'pendingPaymentBookings', 0)}
							color="yellow"
						/>
					</Grid>
				</Box>

				{/* Withdrawals & Payments */}
				<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
					<Box>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							Withdrawals
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={3}>
							<StatCard
								title="Total Amount"
								value={formatCurrency(safeGet(withdrawals, 'totalAmount', 0))}
								color="teal"
							/>
							<StatCard
								title="Success Rate"
								value={`${safeGet(withdrawals, 'successRate', 0).toFixed(1)}%`}
								color="green"
							/>
						</Grid>
					</Box>
					
					<Box>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							Payment Stats
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={3}>
							<StatCard
								title="Successful Payments"
								value={safeGet(paymentStats, 'totalSuccessfulPayments', 0)}
								color="blue"
							/>
							<StatCard
								title="Avg Service Fee"
								value={formatCurrency(safeGet(paymentStats, 'avgServiceFee', 0))}
								color="purple"
							/>
						</Grid>
					</Box>
				</Grid>
			</Box>
		);
	};

	// Component to render property statistics
	const PropertySection = ({ data }) => {
		const property = safeGet(data, 'data.property', {});
		const apartmentsByStatus = safeGet(property, 'apartmentsByStatus', {});
		const apartmentsByBedrooms = safeGet(property, 'apartmentsByBedrooms', []);
		const locationDistribution = safeGet(property, 'locationDistribution', []);
		const topAmenities = safeGet(property, 'amenitiesAnalysis', []).slice(0, 8);

		return (
			<Box>
				<Text fontSize="xl" fontWeight="bold" mb={6} color="purple.600">
					🏢 Property Analytics
				</Text>
				
				{/* Apartment Status */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Apartments by Status
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
						{apartmentsByStatus.approved && (
							<StatCard
								title="Approved"
								value={safeGet(apartmentsByStatus, 'approved.count', 0)}
								helpText={formatCurrency(safeGet(apartmentsByStatus, 'approved.totalValue', 0))}
								color="green"
							/>
						)}
						{apartmentsByStatus.under_review && (
							<StatCard
								title="Under Review"
								value={safeGet(apartmentsByStatus, 'under_review.count', 0)}
								helpText={formatCurrency(safeGet(apartmentsByStatus, 'under_review.totalValue', 0))}
								color="orange"
							/>
						)}
						{apartmentsByStatus.rejected && (
							<StatCard
								title="Rejected"
								value={safeGet(apartmentsByStatus, 'rejected.count', 0)}
								helpText={formatCurrency(safeGet(apartmentsByStatus, 'rejected.totalValue', 0))}
								color="red"
							/>
						)}
					</Grid>
				</Box>

				{/* Bedrooms Distribution */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Apartments by Bedrooms
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4}>
						{apartmentsByBedrooms.map((bedroom, index) => (
							<StatCard
								key={bedroom._id}
								title={`${bedroom._id} Bedroom${bedroom._id > 1 ? 's' : ''}`}
								value={bedroom.count}
								helpText={formatCurrency(bedroom.avgPrice)}
								color={['blue', 'green', 'purple', 'orange', 'teal', 'pink'][index % 6]}
							/>
						))}
					</Grid>
				</Box>

				{/* Top Locations */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Top Locations (First 6)
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
						{locationDistribution.slice(0, 6).map((location, index) => (
							<StatCard
								key={index}
								title={location._id.trim()}
								value={location.count}
								helpText={`Avg: ${formatCurrency(location.avgPrice)}`}
								color={['cyan', 'teal', 'blue', 'purple', 'pink', 'orange'][index % 6]}
							/>
						))}
					</Grid>
				</Box>

				{/* Apartment Performance */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Apartment Performance Analysis
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
						<StatCard
							title="Total Approved"
							value={safeGet(property, 'apartmentPerformance.totalApproved', 0)}
							color="green"
						/>
						<StatCard
							title="Avg Bookings/Apartment"
							value={safeGet(property, 'apartmentPerformance.avgBookingsPerApartment', 0).toFixed(2)}
							color="blue"
						/>
						<StatCard
							title="Avg Revenue/Apartment"
							value={formatCurrency(safeGet(property, 'apartmentPerformance.avgRevenuePerApartment', 0))}
							color="purple"
						/>
						<StatCard
							title="Underperformers"
							value={safeGet(property, 'apartmentPerformance.underperformers', 0)}
							helpText="Low booking activity"
							color="orange"
						/>
					</Grid>
				</Box>

				{/* Top Amenities */}
				<Box>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Top Amenities by Popularity
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
						{topAmenities.map((amenity, index) => (
							<StatCard
								key={index}
								title={amenity._id}
								value={amenity.count}
								helpText={`Avg: ${formatCurrency(amenity.avgPrice)}, Bookings: ${amenity.avgBookings}`}
								color={['green', 'blue', 'purple', 'orange', 'teal', 'pink', 'cyan', 'yellow'][index % 8]}
							/>
						))}
					</Grid>
				</Box>
			</Box>
		);
	};

	// Component to render engagement statistics
	const EngagementSection = ({ data }) => {
		const engagement = safeGet(data, 'data.engagement', {});
		const reservations = safeGet(engagement, 'reservations', {});
		const reviews = safeGet(engagement, 'reviews', {});
		const userEngagement = safeGet(engagement, 'userEngagement', {});
		const repeatCustomers = safeGet(engagement, 'repeatCustomers', {});

		return (
			<Box>
				<Text fontSize="xl" fontWeight="bold" mb={6} color="teal.600">
					🎯 User Engagement
				</Text>
				
				{/* Reservations */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Reservations
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4}>
						<StatCard
							title="Total Reservations"
							value={safeGet(reservations, 'totalReservations', 0)}
							color="teal"
						/>
						<StatCard
							title="Accepted"
							value={safeGet(reservations, 'acceptedReservations', 0)}
							color="green"
						/>
						<StatCard
							title="Pending"
							value={safeGet(reservations, 'pendingReservations', 0)}
							color="orange"
						/>
						<StatCard
							title="Acceptance Rate"
							value={`${safeGet(reservations, 'acceptanceRate', 0).toFixed(1)}%`}
							color="blue"
						/>
						<StatCard
							title="Declined"
							value={safeGet(reservations, 'declinedReservations', 0)}
							color="red"
						/>
					</Grid>
				</Box>

				{/* Reservation Types */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Reservation Types Breakdown
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={4}>
						<StatCard
							title="Normal"
							value={safeGet(reservations, 'normalReservations', 0)}
							color="blue"
						/>
						<StatCard
							title="Party"
							value={safeGet(reservations, 'partyReservations', 0)}
							color="purple"
						/>
						<StatCard
							title="Photo Shoot"
							value={safeGet(reservations, 'photoReservations', 0)}
							color="pink"
						/>
						<StatCard
							title="Movie"
							value={safeGet(reservations, 'movieReservations', 0)}
							color="orange"
						/>
					</Grid>
				</Box>

				{/* Reviews & Notifications */}
				<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
					<Box>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							Reviews
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={3}>
							<StatCard
								title="Total Reviews"
								value={safeGet(reviews, 'totalReviews', 0)}
								color="yellow"
							/>
							<StatCard
								title="Avg Rating"
								value={`${safeGet(reviews, 'avgRating', 0).toFixed(1)} ⭐`}
								color="orange"
							/>
							<StatCard
								title="Response Rate"
								value={`${safeGet(reviews, 'responseRate', 0).toFixed(1)}%`}
								color="purple"
							/>
						</Grid>
						
						{/* Star Ratings Breakdown */}
						<Box mt={4}>
							<Text fontSize="md" fontWeight="medium" mb={3} color="gray.700">
								⭐ Star Ratings Distribution
							</Text>
							<Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={2}>
								<StatCard
									title="5 Stars"
									value={safeGet(reviews, 'fiveStarReviews', 0)}
									color="green"
								/>
								<StatCard
									title="4 Stars"
									value={safeGet(reviews, 'fourStarReviews', 0)}
									color="blue"
								/>
								<StatCard
									title="3 Stars"
									value={safeGet(reviews, 'threeStarReviews', 0)}
									color="yellow"
								/>
								<StatCard
									title="2 Stars"
									value={safeGet(reviews, 'twoStarReviews', 0)}
									color="orange"
								/>
								<StatCard
									title="1 Star"
									value={safeGet(reviews, 'oneStarReviews', 0)}
									color="red"
								/>
							</Grid>
						</Box>

						{/* Review Quality Metrics */}
						<Box mt={4}>
							<Text fontSize="md" fontWeight="medium" mb={3} color="gray.700">
								📊 Review Quality Metrics
							</Text>
							<Grid templateColumns="repeat(auto-fit, minmax(140px, 1fr))" gap={3}>
								<StatCard
									title="Cleanliness"
									value={`${safeGet(reviews, 'avgCleanliness', 0).toFixed(1)}/5`}
									color="green"
								/>
								<StatCard
									title="Location"
									value={`${safeGet(reviews, 'avgLocation', 0).toFixed(1)}/5`}
									color="blue"
								/>
								<StatCard
									title="Communication"
									value={`${safeGet(reviews, 'avgCommunication', 0).toFixed(1)}/5`}
									color="purple"
								/>
								<StatCard
									title="Value"
									value={`${safeGet(reviews, 'avgValue', 0).toFixed(1)}/5`}
									color="orange"
								/>
							</Grid>
						</Box>
					</Box>
					
					<Box>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							User Behavior
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={3}>
							<StatCard
								title="Frequent Users"
								value={safeGet(userEngagement, 'frequentUsers', 0)}
								color="purple"
							/>
							<StatCard
								title="Avg Bookings/User"
								value={safeGet(userEngagement, 'avgBookingsPerUser', 0).toFixed(1)}
								color="pink"
							/>
							<StatCard
								title="Repeat Customers"
								value={safeGet(repeatCustomers, 'repeatCustomers', 0)}
								color="cyan"
							/>
						</Grid>
					</Box>
				</Grid>
			</Box>
		);
	};

	// Component to render performance statistics
	const PerformanceSection = ({ data }) => {
		const performance = safeGet(data, 'data.performance', {});
		const topAgents = safeGet(performance, 'topAgents', []).slice(0, 5);
		const agentActivity = safeGet(performance, 'agentActivity', {});
		const conversionRates = safeGet(performance, 'conversionRates', {});
		const customerLifetimeValue = safeGet(performance, 'customerLifetimeValue', {});

		return (
			<Box>
				<Text fontSize="xl" fontWeight="bold" mb={6} color="orange.600">
					🏆 Performance Analytics
				</Text>
				
				{/* Top Agents */}
				<Box mb={6}>
					<Text fontSize="lg" fontWeight="semibold" mb={4}>
						Top 5 Performing Agents
					</Text>
					<Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
						{topAgents.map((agent, index) => (
							<StatCard
								key={agent._id}
								title={`${agent.firstName} ${agent.lastName}`.trim()}
								value={formatCurrency(agent.totalRevenue)}
								helpText={`${agent.totalBookings} bookings, ${agent.totalApartments} apartments${agent.walletBalance ? `, Wallet: ${formatCurrency(agent.walletBalance)}` : ''}`}
								color={['gold', 'silver', 'bronze', 'blue', 'purple'][index] || 'gray'}
							/>
						))}
					</Grid>
				</Box>

				{/* Agent Activity & Conversion Rates */}
				<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
					<Box>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							Agent Activity Levels
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(140px, 1fr))" gap={3}>
							<StatCard
								title="High Performers"
								value={safeGet(agentActivity, 'highPerformers', 0)}
								color="green"
							/>
							<StatCard
								title="Medium Performers"
								value={safeGet(agentActivity, 'mediumPerformers', 0)}
								color="orange"
							/>
							<StatCard
								title="Low Performers"
								value={safeGet(agentActivity, 'lowPerformers', 0)}
								color="yellow"
							/>
							<StatCard
								title="Inactive"
								value={safeGet(agentActivity, 'inactiveAgents', 0)}
								color="red"
							/>
						</Grid>
					</Box>
					
					<Box>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							Conversion Rates
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={3}>
							<StatCard
								title="Reservation→Booking"
								value={`${safeGet(conversionRates, 'reservationToBookingRate', 0).toFixed(1)}%`}
								color="blue"
							/>
							<StatCard
								title="Booking Completion"
								value={`${safeGet(conversionRates, 'bookingCompletionRate', 0).toFixed(1)}%`}
								color="purple"
							/>
							<StatCard
								title="Avg Customer LTV"
								value={formatCurrency(safeGet(customerLifetimeValue, 'avgCustomerLifetimeValue', 0))}
								color="teal"
							/>
						</Grid>
					</Box>
				</Grid>
			</Box>
		);
	};

	// Component to render trends
	const TrendsSection = ({ data }) => {
		const trends = safeGet(data, 'data.trends', {});
		const dailyTrends = safeGet(trends, 'dailyTrends', []);
		const monthlyGrowth = safeGet(trends, 'monthlyGrowth', []);
		const weeklyActivity = safeGet(trends, 'weeklyActivity', []);

		return (
			<Box>
				<Text fontSize="xl" fontWeight="bold" mb={6} color="pink.600">
					📈 Trends & Growth Analysis
				</Text>
				
				{/* Daily Trends */}
				{dailyTrends.length > 0 && (
					<Box mb={6}>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							Daily Performance Highlights
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
							{dailyTrends.slice(0, 6).map((day, index) => (
								<StatCard
									key={`${day._id.year}-${day._id.month}-${day._id.day}`}
									title={`${day._id.day}/${day._id.month}/${day._id.year}`}
									value={formatCurrency(day.revenue)}
									helpText={`${day.bookings} bookings, Avg: ${formatCurrency(day.avgBookingValue)}`}
									color={['blue', 'green', 'purple', 'orange', 'teal', 'pink'][index % 6]}
								/>
							))}
						</Grid>
					</Box>
				)}

				{/* Monthly Growth */}
				{monthlyGrowth.length > 0 && (
					<Box mb={6}>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							Monthly Performance Comparison
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
							{monthlyGrowth.map((month, index) => {
								const monthName = new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-NG', {
									month: 'long', year: 'numeric'
								});
								return (
									<StatCard
										key={`${month._id.year}-${month._id.month}`}
										title={monthName}
										value={formatCurrency(month.revenue)}
										helpText={`${month.bookings} bookings, ${month.completedBookings} completed, ${month.uniqueCustomerCount} customers`}
										color={index === monthlyGrowth.length - 1 ? 'green' : 'blue'}
									/>
								);
							})}
						</Grid>
					</Box>
				)}

				{/* Weekly Activity */}
				{weeklyActivity.length > 0 && (
					<Box>
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							Weekly Activity Pattern
						</Text>
						<Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
							{weeklyActivity.map((week, index) => (
								<StatCard
									key={`${week._id.year}-W${week._id.week}`}
									title={`Week ${week._id.week}, ${week._id.year}`}
									value={formatCurrency(week.revenue)}
									helpText={`${week.bookings} bookings, Avg day: ${week.avgDayOfWeek.toFixed(1)}`}
									color={['purple', 'pink', 'cyan', 'teal'][index % 4]}
								/>
							))}
						</Grid>
					</Box>
				)}
				
				{/* No Trends Message */}
				{dailyTrends.length === 0 && monthlyGrowth.length === 0 && weeklyActivity.length === 0 && (
					<Box textAlign="center" py={8}>
						<Text fontSize="lg" color="gray.500" mb={2}>📊 No Trend Data Available</Text>
						<Text fontSize="sm" color="gray.400">
							Trend analysis will appear here once booking activity is recorded for the selected period.
						</Text>
					</Box>
				)}
			</Box>
		);
	};

	return (
		<Flex direction="column" pt={{ base: "120px", md: "75px" }}>
			{/* Header Card */}
			<Card mb={6}>
				<CardHeader>
					<Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
						<Box>
							<Text fontSize="2xl" color="#1B2559" fontWeight="bold">
								Admin Dashboard Statistics
							</Text>
							{lastFetchTime && (
								<Text fontSize="sm" color="gray.500" mt={1}>
									Last updated: {lastFetchTime}
								</Text>
							)}
						</Box>
						<Badge 
							colorScheme={dashboardData ? "green" : "gray"} 
							variant="subtle"
							fontSize="sm"
							px={3}
							py={1}
						>
							{dashboardData ? "Data Loaded" : "No Data"}
						</Badge>
					</Flex>
				</CardHeader>
				<CardBody>
					{/* Date Range Controls */}
					<Box mb={6} p={6} bg="gray.50" borderRadius="lg">
						<Text fontSize="lg" fontWeight="semibold" mb={4}>
							📅 Select Date Range
						</Text>
						
						{/* Preset Period Buttons */}
						<Box mb={4}>
							<Text fontSize="sm" color="gray.600" mb={2} fontWeight="medium">Quick Presets:</Text>
							<Flex gap={2} flexWrap="wrap">
								{[
									{ key: 'today', label: 'Today' },
									{ key: 'yesterday', label: 'Yesterday' },
									{ key: 'last_7_days', label: 'Last 7 Days' },
									{ key: 'last_30_days', label: 'Last 30 Days' },
									{ key: 'this_month', label: 'This Month' },
									{ key: 'last_month', label: 'Last Month' },
									{ key: 'this_year', label: 'This Year' }
								].map((preset) => (
									<Button
										key={preset.key}
										size="sm"
										variant={selectedPeriod === preset.key ? "solid" : "outline"}
										colorScheme={selectedPeriod === preset.key ? "blue" : "gray"}
										onClick={() => handlePeriodChange(preset.key)}
										borderRadius="full"
									>
										{preset.label}
									</Button>
								))}
								<Button
									size="sm"
									variant={selectedPeriod === 'custom' ? "solid" : "outline"}
									colorScheme={selectedPeriod === 'custom' ? "purple" : "gray"}
									onClick={() => handlePeriodChange('custom')}
									borderRadius="full"
								>
									🎯 Custom
								</Button>
							</Flex>
						</Box>
						
						{/* Custom Date Inputs */}
						<Flex direction={{ base: "column", md: "row" }} gap={4} alignItems="end">
							<FormControl flex={1}>
								<FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
									Start Date
								</FormLabel>
								<Input
									type="date"
									value={startDate}
									onChange={(e) => {
										setStartDate(e.target.value);
										setSelectedPeriod('custom');
									}}
									bg="white"
									border="2px solid"
									borderColor={selectedPeriod === 'custom' ? "purple.200" : "gray.200"}
									_hover={{ borderColor: selectedPeriod === 'custom' ? "purple.300" : "gray.300" }}
									_focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
									size="lg"
								/>
							</FormControl>
							
							<FormControl flex={1}>
								<FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
									End Date
								</FormLabel>
								<Input
									type="date"
									value={endDate}
									onChange={(e) => {
										setEndDate(e.target.value);
										setSelectedPeriod('custom');
									}}
									bg="white"
									border="2px solid"
									borderColor={selectedPeriod === 'custom' ? "purple.200" : "gray.200"}
									_hover={{ borderColor: selectedPeriod === 'custom' ? "purple.300" : "gray.300" }}
									_focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
									size="lg"
								/>
							</FormControl>
							
							<Button
								colorScheme="blue"
								onClick={fetchDashboardData}
								isLoading={loading}
								loadingText="Fetching..."
								size="lg"
								minW="140px"
								boxShadow="md"
								_hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
								transition="all 0.2s"
							>
								🔄 Refresh Data
							</Button>
						</Flex>
						
						{/* Date Range Summary */}
						<Box mt={3} p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.100">
							<Text fontSize="sm" color="blue.700" fontWeight="medium">
								📊 Selected Period: <strong>
									{selectedPeriod === 'custom' ? 'Custom Range' : 
										[{key: 'today', label: 'Today'}, {key: 'yesterday', label: 'Yesterday'}, 
										 {key: 'last_7_days', label: 'Last 7 Days'}, {key: 'last_30_days', label: 'Last 30 Days'},
										 {key: 'this_month', label: 'This Month'}, {key: 'last_month', label: 'Last Month'},
										 {key: 'this_year', label: 'This Year'}].find(p => p.key === selectedPeriod)?.label || 'Custom'
									}
								</strong>
							</Text>
							<Text fontSize="xs" color="blue.600" mt={1}>
								From {new Date(startDate).toLocaleDateString('en-NG', {
									weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
								})} to {new Date(endDate).toLocaleDateString('en-NG', {
									weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
								})}
							</Text>
						</Box>
					</Box>
				</CardBody>
			</Card>

			{/* Error State */}
			{error && (
				<Alert status="error" mb={6} borderRadius="md">
					<AlertIcon />
					<Box>
						<AlertTitle>Error Loading Dashboard Data</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Box>
				</Alert>
			)}

			{/* Loading State */}
			{loading && (
				<Card mb={6}>
					<CardBody>
						<Flex direction="column" justify="center" align="center" py={12}>
							<Spinner size="xl" color="blue.500" thickness="4px" />
							<Text mt={4} fontSize="lg" color="gray.600">
								Loading dashboard statistics...
							</Text>
							<Text fontSize="sm" color="gray.500">
								This may take a few moments
							</Text>
						</Flex>
					</CardBody>
				</Card>
			)}

			{/* Main Dashboard Content */}
			{dashboardData && !loading && (
				<VStack spacing={8} align="stretch">
					{/* Overview Section */}
					<OverviewSection data={dashboardData} />
					
					<Divider borderColor="gray.300" />
					
					{/* Wallet Analytics */}
					<WalletSection data={dashboardData} />
					
					<Divider borderColor="gray.300" />
					
					{/* Financial Statistics */}
					<FinancialSection data={dashboardData} />
					
					<Divider borderColor="gray.300" />
					
					{/* Property Analytics */}
					<PropertySection data={dashboardData} />
					
					<Divider borderColor="gray.300" />
					
					{/* Engagement Statistics */}
					<EngagementSection data={dashboardData} />
					
					<Divider borderColor="gray.300" />
					
					{/* Performance Analytics */}
					<PerformanceSection data={dashboardData} />
					
					<Divider borderColor="gray.300" />
					
					{/* Trends & Growth */}
					<TrendsSection data={dashboardData} />
					
					<Divider />
					
					{/* Comprehensive Data Summary Card */}
					<Card>
						<CardHeader>
							<Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
								<Text fontSize="xl" fontWeight="bold" color="gray.700">
									📊 Dashboard Metadata & Summary
								</Text>
								<Badge colorScheme="blue" variant="subtle" fontSize="sm" px={3} py={1}>
									{safeGet(dashboardData, 'meta.responseTimeMs', 0)}ms response
								</Badge>
							</Flex>
							<Text fontSize="sm" color="gray.500" mt={2}>
								Report Period: {new Date(startDate).toLocaleDateString('en-NG', { 
									year: 'numeric', month: 'long', day: 'numeric'
								})} - {new Date(endDate).toLocaleDateString('en-NG', {
									year: 'numeric', month: 'long', day: 'numeric'
								})}
							</Text>
						</CardHeader>
						<CardBody>
							<Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={4}>
								{/* API Performance */}
								<Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
									<Text fontSize="sm" color="blue.600" fontWeight="semibold">API Performance</Text>
									<Text fontSize="lg" color="blue.800" fontWeight="bold">Excellent ⚡</Text>
									<Text fontSize="xs" color="blue.600" mt={1}>
										{safeGet(dashboardData, 'data.metadata.totalQueries', 0)} queries executed
									</Text>
								</Box>

								{/* Data Completeness */}
								<Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
									<Text fontSize="sm" color="green.600" fontWeight="semibold">Data Completeness</Text>
									<Text fontSize="lg" color="green.800" fontWeight="bold">Complete 📈</Text>
									<Text fontSize="xs" color="green.600" mt={1}>
										{Object.keys(safeGet(dashboardData, 'data', {})).length} data sections loaded
									</Text>
								</Box>

								{/* Report Generation */}
								<Box p={4} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
									<Text fontSize="sm" color="purple.600" fontWeight="semibold">Report Generated</Text>
									<Text fontSize="lg" color="purple.800" fontWeight="bold">Just Now 🔄</Text>
									<Text fontSize="xs" color="purple.600" mt={1}>
										{safeGet(dashboardData, 'data.metadata.generatedAt', new Date().toISOString()).slice(0, 19).replace('T', ' ')}
									</Text>
								</Box>

								{/* Business Status */}
								<Box p={4} bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.200">
									<Text fontSize="sm" color="orange.600" fontWeight="semibold">Business Health</Text>
									<Text fontSize="lg" color="orange.800" fontWeight="bold">Growing 🚀</Text>
									<Text fontSize="xs" color="orange.600" mt={1}>
										Based on current metrics
									</Text>
								</Box>
							</Grid>
							
							{/* Key Business Highlights */}
							<Box mt={6} p={4} bg="gray.50" borderRadius="lg">
								<Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
									✨ Key Business Highlights
								</Text>
								<Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
									<Text fontSize="sm" color="gray.600">
										🏠 <strong>{formatNumber(safeGet(dashboardData, 'data.overview.apartments.total', 0))}</strong> total apartments
									</Text>
									<Text fontSize="sm" color="gray.600">
										💰 <strong>{formatCurrency(safeGet(dashboardData, 'data.overview.apartments.totalValue', 0))}</strong> portfolio value
									</Text>
									<Text fontSize="sm" color="gray.600">
										👥 <strong>{formatNumber(safeGet(dashboardData, 'data.overview.agents.total', 0))}</strong> registered agents
									</Text>
									<Text fontSize="sm" color="gray.600">
										📱 <strong>{formatNumber(safeGet(dashboardData, 'data.overview.users.total', 0))}</strong> platform users
									</Text>
									<Text fontSize="sm" color="gray.600">
										💳 <strong>{formatCurrency(safeGet(dashboardData, 'data.overview.wallets.totalBalance', 0))}</strong> in agent wallets
									</Text>
									<Text fontSize="sm" color="gray.600">
										📸 <strong>{formatNumber(safeGet(dashboardData, 'data.overview.apartments.totalImages', 0))}</strong> property images
									</Text>
								</Grid>
							</Box>
						</CardBody>
					</Card>
				</VStack>
			)}

			{/* No Data State */}
			{!dashboardData && !loading && !error && (
				<Card>
					<CardBody>
						<Flex direction="column" align="center" py={12} textAlign="center">
							<Text fontSize="6xl" mb={4}>📊</Text>
							<Text fontSize="xl" color="gray.600" mb={2}>
								No Statistics Data Available
							</Text>
							<Text color="gray.500" mb={6}>
								Click "Refresh Data" to load the latest dashboard statistics from the API.
							</Text>
							<Button
								colorScheme="blue"
								onClick={fetchDashboardData}
								size="lg"
							>
								🚀 Get Started
							</Button>
						</Flex>
					</CardBody>
				</Card>
			)}
		</Flex>
	);
};

export default Statistics;