import { Fragment, useState, useEffect, useContext, useCallback } from "react";
import {
	Box,
	Flex,
	SimpleGrid,
	Spinner,
	Text,
	useToast,
	VStack,
	HStack,
	Icon,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	Avatar,
	Badge
} from "@chakra-ui/react";
import ReactApexChart from "react-apexcharts";
import Card from "../../../components/Card/Card.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import CardBody from "../../../components/Card/CardBody.js";
import {
	BsBuilding,
	BsGraphUpArrow,
	BsCurrencyDollar,
	BsArrowUpRight
} from "react-icons/bs";
import {
	FaUsers,
	FaHotel,
	FaUserTie,
	FaMoneyBillWave,
	FaPiggyBank,
	FaHandHoldingUsd
} from "react-icons/fa";
import { numberWithCommas } from "../../../utils/index.js";
import { AdminGetStatsAPI } from "../../../Endpoints";
import axios from "axios";
import GlobalContext from "../../../Context";

const Dashboard = () => {
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalApartments: 0,
		totalHotels: 0,
		totalAgents: 0,
		totalUsers: 0,
		totalGrossWalletBalance: 0,
		totalNetWalletBalance: 0,
		totalCompanyProfit: 0,
	});
	const toast = useToast();
	const { handleTokenExpired } = useContext(GlobalContext);

	// Chart data
	const [chartData, setChartData] = useState([]);
	const [chartOptions, setChartOptions] = useState({});

	const fetchStats = useCallback(async () => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");

			if (!authToken) {
				console.error('No auth token found. User might need to login again.');
				throw new Error("Authentication required - please login");
			}

			const response = await axios.get(AdminGetStatsAPI, {
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`,
				}
			});

			if (response.data.status === "success") {
				setStats(response.data.data);
			} else {
				throw new Error(response.data.message || "Failed to fetch stats");
			}
		} catch (error) {
			console.error('API Error Details:', {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status
			});

			if (error.response?.status === 401) {
				handleTokenExpired();
				return;
			} else {
				toast({
					title: "Error",
					description: error.message || "Failed to load statistics",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			}
		} finally {
			setLoading(false);
		}
	}, [handleTokenExpired, toast]);

	// Modern stat card component
	const ModernStatCard = ({ title, value, icon, gradient, description, trend }) => {
		return (
			<Card p="20px" bg={gradient} color="white" position="relative" overflow="hidden">
				{/* Background Pattern */}
				<Box
					position="absolute"
					right="-20px"
					top="-20px"
					opacity="0.1"
					transform="rotate(15deg)"
				>
					<Icon as={icon} boxSize="80px" />
				</Box>

				<Stat position="relative" zIndex="1">
					<HStack justify="space-between" mb="10px">
						<Box>
							<Icon as={icon} boxSize="24px" opacity="0.8" />
						</Box>
						{trend && (
							<Badge colorScheme="green" variant="subtle" borderRadius="full" px="8px">
								<HStack spacing="4px">
									<Icon as={BsArrowUpRight} boxSize="12px" />
									<Text fontSize="xs">{trend}</Text>
								</HStack>
							</Badge>
						)}
					</HStack>
					<StatLabel fontSize="sm" opacity="0.8" fontWeight="medium">
						{title}
					</StatLabel>
					<StatNumber fontSize="2xl" fontWeight="bold" mb="4px">
						{numberWithCommas(value)}
					</StatNumber>
					<StatHelpText fontSize="xs" opacity="0.7" mb="0">
						{description}
					</StatHelpText>
				</Stat>
			</Card>
		);
	};

	// Quick stats summary component
	const QuickSummary = () => {
		const totalRevenue = stats.totalGrossWalletBalance + stats.totalCompanyProfit;
		const revenueGrowth = ((stats.totalCompanyProfit / totalRevenue) * 100).toFixed(1);

		return (
			<Card p="24px" bg="white" boxShadow="xl" borderRadius="2xl" border="1px solid" borderColor="gray.100">
				<VStack spacing="20px" align="stretch">
					<HStack justify="space-between" align="center">
						<VStack align="start" spacing="4px">
							<Text fontSize="xl" fontWeight="bold" color="gray.800">
								Quick Overview
							</Text>
							<Text fontSize="sm" color="gray.500">
								Key performance indicators
							</Text>
						</VStack>
						<Avatar bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white" size="md">
							<Icon as={BsGraphUpArrow} boxSize="20px" />
						</Avatar>
					</HStack>

					<SimpleGrid columns={{ base: 1, md: 3 }} spacing="20px">
						<VStack align="start" spacing="8px">
							<HStack>
								<Icon as={FaUsers} color="blue.500" boxSize="16px" />
								<Text fontSize="sm" fontWeight="medium" color="gray.600">
									Platform Users
								</Text>
							</HStack>
							<Text fontSize="2xl" fontWeight="bold" color="blue.600">
								{numberWithCommas(stats.totalUsers + stats.totalAgents)}
							</Text>
							<Text fontSize="xs" color="gray.500">
								Total registered users
							</Text>
						</VStack>

						<VStack align="start" spacing="8px">
							<HStack>
								<Icon as={BsBuilding} color="green.500" boxSize="16px" />
								<Text fontSize="sm" fontWeight="medium" color="gray.600">
									Properties
								</Text>
							</HStack>
							<Text fontSize="2xl" fontWeight="bold" color="green.600">
								{numberWithCommas(stats.totalApartments + stats.totalHotels)}
							</Text>
							<Text fontSize="xs" color="gray.500">
								Total listings
							</Text>
						</VStack>

						<VStack align="start" spacing="8px">
							<HStack>
								<Icon as={BsCurrencyDollar} color="purple.500" boxSize="16px" />
								<Text fontSize="sm" fontWeight="medium" color="gray.600">
									Revenue Share
								</Text>
							</HStack>
							<Text fontSize="2xl" fontWeight="bold" color="purple.600">
								{revenueGrowth}%
							</Text>
							<Text fontSize="xs" color="gray.500">
								Company profit margin
							</Text>
						</VStack>
					</SimpleGrid>
				</VStack>
			</Card>
		);
	};

	useEffect(() => {
		// Initialize chart data with improved styling
		const lineChartOptions = {
			chart: {
				toolbar: {
					show: true,
					tools: {
						download: true,
						selection: true,
						zoom: true,
						zoomin: true,
						zoomout: true,
						pan: true,
					}
				},
				background: 'transparent',
				animations: {
					enabled: true,
					easing: 'easeinout',
					speed: 800,
				}
			},
			tooltip: {
				theme: "dark",
				style: {
					fontSize: '12px',
					fontFamily: 'inherit'
				}
			},
			dataLabels: { enabled: false },
			stroke: {
				curve: "smooth",
				width: 3
			},
			xaxis: {
				type: "string",
				categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
				labels: {
					style: {
						colors: "#a0aec0",
						fontSize: "12px",
						fontWeight: "500"
					},
				},
				axisBorder: {
					show: false
				},
				axisTicks: {
					show: false
				}
			},
			yaxis: {
				labels: {
					style: {
						colors: "#a0aec0",
						fontSize: "12px",
						fontWeight: "500"
					},
					formatter: function (val) {
						return numberWithCommas(val);
					}
				},
			},
			legend: {
				show: true,
				position: 'top',
				horizontalAlign: 'right',
				fontFamily: 'inherit',
				fontWeight: 500,
				fontSize: '12px',
				markers: {
					width: 8,
					height: 8,
					radius: 12,
				}
			},
			grid: {
				strokeDashArray: 3,
				borderColor: '#e2e8f0'
			},
			fill: {
				type: "gradient",
				gradient: {
					shade: "light",
					type: "vertical",
					shadeIntensity: 0.3,
					inverseColors: true,
					opacityFrom: 0.7,
					opacityTo: 0.1,
				},
			},
			colors: ["#667eea", "#f093fb", "#4facfe", "#43e97b"],
		};

		const lineChartData = [
			{ name: "Revenue", data: [3000, 4200, 3500, 5100, 4900, 6200, 6900] },
			{ name: "Bookings", data: [1200, 1500, 1000, 2100, 1800, 2500, 2200] },
			{ name: "New Users", data: [800, 1200, 1400, 1500, 1600, 1800, 2100] },
			{ name: "Properties", data: [1000, 1500, 1100, 1500, 1500, 1900, 2600] },
		];

		setChartData(lineChartData);
		setChartOptions(lineChartOptions);

		// Fetch stats data
		fetchStats();
	}, [fetchStats]);

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<VStack spacing={4}>
						<Spinner size="xl" thickness="4px" color="blue.500" />
						<Text color="gray.500">Loading dashboard...</Text>
					</VStack>
				</Flex>
			) : (
				<Fragment>
					{/* Welcome Header */}
					<VStack align="start" spacing="8px" mb="30px">
						<Text fontSize="2xl" fontWeight="bold" color="gray.800">
							Welcome to Admin Dashboard
						</Text>
						<Text fontSize="md" color="gray.500">
							Here's what's happening with your platform today
						</Text>
					</VStack>

					{/* Main Statistics Cards */}
					<SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px" mb="30px">
						<ModernStatCard
							title="Total Apartments"
							value={stats.totalApartments}
							icon={BsBuilding}
							gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
							description="Apartment listings"
							trend="+12%"
						/>
						<ModernStatCard
							title="Total Hotels"
							value={stats.totalHotels}
							icon={FaHotel}
							gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
							description="Hotel properties"
							trend="+8%"
						/>
						<ModernStatCard
							title="Total Agents"
							value={stats.totalAgents}
							icon={FaUserTie}
							gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
							description="Active agents"
							trend="+15%"
						/>
						<ModernStatCard
							title="Total Users"
							value={stats.totalUsers}
							icon={FaUsers}
							gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
							description="Registered users"
							trend="+22%"
						/>
					</SimpleGrid>

					{/* Financial Statistics */}
					<SimpleGrid columns={{ sm: 1, md: 3 }} spacing="24px" mb="30px">
						<ModernStatCard
							title="Gross Wallet Balance"
							value={`₦${stats.totalGrossWalletBalance}`}
							icon={FaMoneyBillWave}
							gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
							description="Total balance"
						/>
						<ModernStatCard
							title="Net Wallet Balance"
							value={`₦${stats.totalNetWalletBalance}`}
							icon={FaPiggyBank}
							gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
							description="Available balance"
						/>
						<ModernStatCard
							title="Company Profit"
							value={`₦${stats.totalCompanyProfit}`}
							icon={FaHandHoldingUsd}
							gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
							description="Total profit"
						/>
					</SimpleGrid>

					{/* Quick Summary Section */}
					<Box mb="30px">
						<QuickSummary />
					</Box>

					{/* Analytics Chart */}
					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<VStack align="start" spacing="4px">
								<Text fontSize="xl" fontWeight="bold" color="gray.800">
									Analytics Overview
								</Text>
								<Text fontSize="sm" color="gray.500">
									Platform performance metrics over time
								</Text>
							</VStack>
						</CardHeader>
						<CardBody>
							<Box w="100%" h="400px">
								<ReactApexChart
									options={chartOptions}
									series={chartData}
									type="area"
									width="100%"
									height="100%"
								/>
							</Box>
						</CardBody>
					</Card>
				</Fragment>
			)}
		</Flex>
	);
};

export default Dashboard;