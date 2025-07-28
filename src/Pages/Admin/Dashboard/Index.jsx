import React, { Fragment, useState, useEffect } from "react";
import {
	Box,
	Flex,
	SimpleGrid,
	Spinner,
	Text,
	useColorModeValue,
	useToast,
} from "@chakra-ui/react";
import ReactApexChart from "react-apexcharts";
import Card from "../../../components/Card/Card.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { BsFillPeopleFill } from "react-icons/bs";
import { FaGraduationCap } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { TfiWrite } from "react-icons/tfi";
import { numberWithCommas } from "../../../utils/index.js";
import MiniStatistics from "../Landlord/components/MiniStatistics.js";
import { AdminGetStatsAPI } from "../../../Endpoints";
import axios from "axios";

const Dashboard = () => {
	const textColor = useColorModeValue("gray.700", "white");
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

	// Chart data
	const [chartData, setChartData] = useState([]);
	const [chartOptions, setChartOptions] = useState({});

	// const fetchStats = async () => {
	// 	setLoading(true);
	// 	try {
	// 		const accessToken = localStorage.getItem("authToken");

	// 		if (!accessToken) {
	// 			throw new Error("No authentication token found");
	// 		}

	// 		const response = await axios.get(AdminGetStatsAPI, {
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 				"Authorization": `Bearer ${accessToken}`,
	// 			}
	// 		});

	// 		if (response.data.status === "success") {
	// 			setStats(response.data.data);
	// 		} else {
	// 			throw new Error(response.data.message || "Failed to fetch stats");
	// 		}
	// 	} catch (error) {
	// 		console.error("Error fetching stats:", error);

	// 		if (error.response?.status === 401) {
	// 			try {

	// 				toast({
	// 					title: "Session Expired",
	// 					description: "Please login again",
	// 					status: "error",
	// 					duration: 5000,
	// 					isClosable: true,
	// 				});
	// 				return;
	// 			} catch (refreshError) {
	// 				console.error("Token refresh failed:", refreshError);

	// 				localStorage.removeItem("authToken");
	// 				toast({
	// 					title: "Session Expired",
	// 					description: "Please login again",
	// 					status: "error",
	// 					duration: 5000,
	// 					isClosable: true,
	// 				});
	// 				return;
	// 			}
	// 		}

	// 		toast({
	// 			title: "Error",
	// 			description: error.response?.data?.message || error.message,
	// 			status: "error",
	// 			duration: 5000,
	// 			isClosable: true,
	// 		});
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };



	const fetchStats = async () => {
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
				localStorage.removeItem("authToken");
				localStorage.removeItem("refreshToken");

				toast({
					title: "Session Expired",
					description: "Please login again",
					status: "error",
					duration: 5000,
					isClosable: true,
				});

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
	};















	useEffect(() => {
		// Initialize chart data
		const lineChartOptions = {
			chart: {
				toolbar: { show: true },
			},
			tooltip: { theme: "dark" },
			dataLabels: { enabled: false },
			stroke: { curve: "smooth" },
			xaxis: {
				type: "string",
				categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
				labels: {
					style: {
						colors: "#c8cfca",
						fontSize: "12px",
					},
				},
			},
			yaxis: {
				labels: {
					style: {
						colors: "#c8cfca",
						fontSize: "12px",
					},
				},
			},
			legend: { show: true },
			grid: { strokeDashArray: 5 },
			fill: {
				type: "gradient",
				gradient: {
					shade: "light",
					type: "vertical",
					shadeIntensity: 0.5,
					inverseColors: true,
					opacityFrom: 0.8,
					opacityTo: 0,
				},
				colors: ["#4FD1C5", "#2D3748", "#7484FD", "#f700ff"],
			},
			colors: ["#4FD1C5", "#2D3748", "#7484FD", "#f700ff"],
		};

		const lineChartData = [
			{ name: "Total", data: [3000, 4200, 3500, 5100, 4900, 6200, 6900] },
			{ name: "Subscriptions", data: [1200, 1500, 1000, 2100, 1800, 2500, 2200] },
			{ name: "Course", data: [800, 1200, 1400, 1500, 1600, 1800, 2100] },
			{ name: "Exams", data: [1000, 1500, 1100, 1500, 1500, 1900, 2600] },
		];

		setChartData(lineChartData);
		setChartOptions(lineChartOptions);

		// Fetch stats data
		fetchStats();
	}, []);

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<Spinner size="xl" />
				</Flex>
			) : (
				<Fragment>
					<CardHeader mb="20px" pl="22px">
						<Flex direction="column" alignSelf="flex-start">
							<Text fontSize="lg" color={textColor} fontWeight="bold" mb="6px">
								Overall Statistics
							</Text>
						</Flex>
					</CardHeader>
					<SimpleGrid columns={{ sm: 1, md: 3, xl: 4 }} spacing="24px">
						<MiniStatistics
							title={"Total Apartments"}
							amount={numberWithCommas(stats.totalApartments)}
							icon={BsFillPeopleFill}
						/>
						<MiniStatistics
							title={"Total Hotels"}
							amount={numberWithCommas(stats.totalHotels)}
							icon={GiMoneyStack}
						/>
						<MiniStatistics
							title={"Total Agents"}
							amount={numberWithCommas(stats.totalAgents)}
							icon={FaGraduationCap}
						/>
						<MiniStatistics
							title={"Total Users"}
							amount={numberWithCommas(stats.totalUsers)}
							icon={TfiWrite}
						/>
						<MiniStatistics
							title={"Total Gross Wallet Balance"}
							amount={numberWithCommas(stats.totalGrossWalletBalance)}
							icon={TfiWrite}
						/>
						<MiniStatistics
							title={"Total Net wallet Balance"}
							amount={numberWithCommas(stats.totalNetWalletBalance)}
							icon={TfiWrite}
						/>
						<MiniStatistics
							title={"Total Company Profit"}
							amount={numberWithCommas(stats.totalCompanyProfit)}
							icon={TfiWrite}
						/>
					</SimpleGrid>

					<Flex justify="space-between" align="center" mb="1rem" w="100%" pt={{ base: "120px", md: "25px" }}>
						<Card p="28px 10px 16px 0px" mb={{ sm: "26px", lg: "0px" }}>
							<CardHeader mb="20px" pl="22px">
								<Flex direction="column" alignSelf="flex-start">
									<Text fontSize="lg" color={textColor} fontWeight="bold" mb="6px">
										Payments History
									</Text>
								</Flex>
							</CardHeader>
							<Box w="100%" h={{ sm: "300px" }} ps="8px">
								<ReactApexChart
									options={chartOptions}
									series={chartData}
									type="area"
									width="100%"
									height="100%"
								/>
							</Box>
						</Card>
					</Flex>
				</Fragment>
			)}
		</Flex>
	);
};

export default Dashboard;
