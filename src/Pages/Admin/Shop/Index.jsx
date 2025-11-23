import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Divider,
	Flex,
	Grid,
	GridItem,
	HStack,
	Image,
	Input,
	InputGroup,
	InputLeftAddon,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	SimpleGrid,
	Spinner,
	Switch,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	Textarea,
	useDisclosure,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { SHOP_ENDPOINTS } from "../../../api/endpoints";
import GlobalContext from "../../../Context";
import Card from "../../../components/Card/Card";
import CardBody from "../../../components/Card/CardBody";
import CardHeader from "../../../components/Card/CardHeader";
import axios from "axios";
import { 
	FaBoxOpen, 
	FaClipboardList, 
	FaPlus, 
	FaPenToSquare, 
	FaTrash, 
	FaCircleCheck, 
	FaClock,
	FaUser,
	FaCalendar,
	FaImage,
	FaCartShopping
} from "react-icons/fa6";

const initialProductForm = {
	name: "",
	description: "",
	image: "",
	price: "",
	quantity: "",
	isActive: true,
};

const statusColors = {
	pending: "orange",
	approved: "green",
	rejected: "red",
	fulfilled: "blue",
};

const ShopAdmin = () => {
	const toast = useToast();
	const { handleTokenExpired } = useContext(GlobalContext);
	const [products, setProducts] = useState([]);
	const [loadingProducts, setLoadingProducts] = useState(false);
	const [requests, setRequests] = useState([]);
	const [loadingRequests, setLoadingRequests] = useState(false);
	const [pendingCount, setPendingCount] = useState(0);
	const [requestStatusFilter, setRequestStatusFilter] = useState("all");

	const [productForm, setProductForm] = useState(initialProductForm);
	const [editingProduct, setEditingProduct] = useState(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [savingProduct, setSavingProduct] = useState(false);
	const [deletingProductId, setDeletingProductId] = useState(null);

	const [actionLoading, setActionLoading] = useState(false);

	const authToken = useMemo(() => localStorage.getItem("authToken"), []);

	const buildAuthHeaders = useCallback(
		(token) => ({
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		}),
		[]
	);

	const authHeadersRef = useRef(buildAuthHeaders(authToken));

	useEffect(() => {
		authHeadersRef.current = buildAuthHeaders(authToken);
	}, [authToken, buildAuthHeaders]);

	const fetchProducts = useCallback(async () => {
		setLoadingProducts(true);
		try {
			const response = await axios.get(SHOP_ENDPOINTS.products.list, { headers: authHeadersRef.current });
			if (response.data?.success) {
				setProducts(response.data.data || []);
			} else {
				setProducts([]);
			}
		} catch (error) {
			console.error("Error fetching products:", error);
			toast({
				title: "Error",
				description: error.response?.data?.error || "Unable to load products",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
			if (error.response?.status === 401) {
				handleTokenExpired();
			}
		} finally {
			setLoadingProducts(false);
		}
	}, [handleTokenExpired, toast]);

	const fetchRequests = useCallback(async () => {
		setLoadingRequests(true);
		try {
			const params = requestStatusFilter === "all" ? undefined : { status: requestStatusFilter };
			const response = await axios.get(SHOP_ENDPOINTS.requests.list, {
				headers: authHeadersRef.current,
				params,
			});
			if (response.data?.success) {
				const requestsData = response.data.data || [];
				// Debug: Log requests with payment info
				console.log("Fetched requests:", requestsData);
				requestsData.forEach((req) => {
					if (req.paymentReceipt || req.paymentAmount) {
						console.log("Request with payment:", {
							id: req._id || req.id,
							paymentReceipt: req.paymentReceipt,
							paymentAmount: req.paymentAmount,
							paymentConfirmed: req.paymentConfirmed,
						});
					}
				});
				setRequests(requestsData);
			} else {
				setRequests([]);
			}
		} catch (error) {
			console.error("Error fetching requests:", error);
			toast({
				title: "Error",
				description: error.response?.data?.error || "Unable to load requests",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
			if (error.response?.status === 401) {
				handleTokenExpired();
			}
		} finally {
			setLoadingRequests(false);
		}
	}, [handleTokenExpired, requestStatusFilter, toast]);

	const fetchPendingCount = useCallback(async () => {
		try {
			const response = await axios.get(SHOP_ENDPOINTS.requests.pendingCount, {
				headers: authHeadersRef.current,
			});
			if (typeof response.data?.data === "number") {
				setPendingCount(response.data.data);
			} else if (typeof response.data?.count === "number") {
				setPendingCount(response.data.count);
			}
		} catch (error) {
			console.error("Error fetching pending count:", error);
		}
	}, []);

	useEffect(() => {
		if (!authToken) return;
		fetchProducts();
	}, [authToken, fetchProducts]);

	useEffect(() => {
		if (!authToken) return;
		fetchRequests();
		fetchPendingCount();
	}, [authToken, fetchPendingCount, fetchRequests]);

	const openCreateModal = () => {
		setEditingProduct(null);
		setProductForm(initialProductForm);
		onOpen();
	};

	const openEditModal = (product) => {
		setEditingProduct(product);
		setProductForm({
			name: product.name || "",
			description: product.description || "",
			image: product.image || "",
			price: String(product.price ?? ""),
			quantity: product.quantity !== undefined ? String(product.quantity) : "",
			isActive: product.isActive ?? true,
		});
		onOpen();
	};

	const handleSaveProduct = async () => {
		if (!productForm.name || !productForm.price) {
			toast({
				title: "Validation error",
				description: "Name and price are required",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		const payload = {
			name: productForm.name,
			description: productForm.description || undefined,
			image: productForm.image || undefined,
			price: Number(productForm.price),
			quantity: productForm.quantity ? Number(productForm.quantity) : undefined,
			isActive: productForm.isActive,
		};

		setSavingProduct(true);
		try {
			if (editingProduct?._id || editingProduct?.id) {
				await axios.put(
					SHOP_ENDPOINTS.products.update(editingProduct._id || editingProduct.id),
					payload,
					{ headers: authHeadersRef.current }
				);
				toast({ title: "Product updated", status: "success", duration: 3000 });
			} else {
				await axios.post(SHOP_ENDPOINTS.products.create, payload, { headers: authHeadersRef.current });
				toast({ title: "Product created", status: "success", duration: 3000 });
			}
			onClose();
			fetchProducts();
		} catch (error) {
			console.error("Error saving product:", error);
			const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Unable to save product";
			toast({
				title: "Error saving product",
				description: errorMessage,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			if (error.response?.status === 401) {
				handleTokenExpired();
			}
		} finally {
			setSavingProduct(false);
		}
	};

	const handleDeleteProduct = async (product) => {
		if (!window.confirm(`Delete ${product.name}? This will deactivate the product.`)) {
			return;
		}

		setDeletingProductId(product._id || product.id);
		try {
			await axios.delete(SHOP_ENDPOINTS.products.delete(product._id || product.id), {
				headers: authHeadersRef.current,
			});
			toast({ title: "Product deleted", status: "success", duration: 3000 });
			fetchProducts();
		} catch (error) {
			console.error("Error deleting product:", error);
			toast({
				title: "Error",
				description: error.response?.data?.error || "Unable to delete product",
				status: "error",
				duration: 4000,
			});
			if (error.response?.status === 401) {
				handleTokenExpired();
			}
		} finally {
			setDeletingProductId(null);
		}
	};

	const handleConfirmPayment = async (request) => {
		const requestId = request._id || request.id;
		setActionLoading(true);
		try {
			await axios.post(SHOP_ENDPOINTS.requests.confirmPayment(requestId), {}, {
				headers: authHeadersRef.current,
			});
			toast({
				title: "Payment Confirmed",
				description: "Payment receipt has been confirmed. You can now approve the request.",
				status: "success",
				duration: 3000,
			});
			fetchRequests();
			fetchPendingCount();
		} catch (error) {
			console.error("Error confirming payment:", error);
			const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Unable to confirm payment";
			toast({
				title: "Error confirming payment",
				description: errorMessage,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			if (error.response?.status === 401) {
				handleTokenExpired();
			}
		} finally {
			setActionLoading(false);
		}
	};

	const handleApproveRequest = async (request) => {
		const requestId = request._id || request.id;
		setActionLoading(true);
		try {
			await axios.post(SHOP_ENDPOINTS.requests.approve(requestId), {}, {
				headers: authHeadersRef.current,
			});
			toast({
				title: "Request Approved",
				description: "Product request has been approved successfully",
				status: "success",
				duration: 3000,
			});
			fetchRequests();
			fetchPendingCount();
		} catch (error) {
			console.error("Error approving request:", error);
			const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Unable to approve request";
			toast({
				title: "Error approving request",
				description: errorMessage,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			if (error.response?.status === 401) {
				handleTokenExpired();
			}
		} finally {
			setActionLoading(false);
		}
	};

	const renderProductCard = (product) => (
		<Card 
			key={product._id || product.id} 
			border="2px solid" 
			borderColor="gray.200" 
			borderRadius="2xl"
			overflow="hidden"
			shadow="lg"
			_hover={{ 
				shadow: "2xl", 
				transform: "translateY(-4px)",
				borderColor: "yellow.300"
			}}
			transition="all 0.3s ease"
			bg="white"
			position="relative"
			display="flex"
			flexDirection="column"
			h="100%"
		>
			{/* Product Image */}
			{product.image && (
				<Box 
					w="100%" 
					h="220px" 
					overflow="hidden" 
					bg="gray.100"
					position="relative"
					flexShrink={0}
				>
					<Image
						src={product.image}
						alt={product.name}
						w="100%"
						h="100%"
						objectFit="cover"
						fallback={
							<Flex align="center" justify="center" h="100%" bg="gray.100">
								<FaImage size="48px" color="gray" />
							</Flex>
						}
					/>
					{/* Status Badge Overlay */}
					<Box position="absolute" top={3} right={3}>
						<Badge 
							colorScheme={product.isActive ? "green" : "gray"} 
							size="sm"
							borderRadius="full"
							px={3}
							py={1.5}
							fontWeight="700"
							shadow="md"
						>
							{product.isActive ? "Active" : "Inactive"}
						</Badge>
					</Box>
				</Box>
			)}
			
			<CardBody p={5} flex={1} display="flex" flexDirection="column">
				{/* Product Name */}
				<Box mb={3}>
					<Text 
						fontSize="md" 
						fontWeight="700" 
						color="gray.800" 
						lineHeight="1.4"
						whiteSpace="nowrap"
						overflow="hidden"
						textOverflow="ellipsis"
						title={product.name}
					>
						{product.name}
					</Text>
				</Box>
				
				{/* Description */}
				{product.description && (
					<Text 
						color="gray.600" 
						fontSize="xs" 
						mb={3} 
						noOfLines={2}
						lineHeight="1.5"
						flexShrink={0}
					>
						{product.description}
					</Text>
				)}
				
				{/* Price and Stock Section */}
				<Box 
					bg="linear-gradient(135deg, #FED7AA 0%, #FFF5E6 100%)"
					borderRadius="lg" 
					px={4} 
					py={3}
					mb={3}
					border="2px solid"
					borderColor="orange.300"
					display="inline-flex"
					alignSelf="flex-start"
					shadow="sm"
					flexShrink={0}
				>
					<VStack align="stretch" spacing={2}>
						<HStack justify="space-between" align="center">
							<Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">
								Price
							</Text>
							{product.quantity !== undefined && (
								<Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">
									Stock
								</Text>
							)}
						</HStack>
						<HStack justify="space-between" align="center">
							<Text fontSize="xl" fontWeight="800" color="orange.700">
								₦{Number(product.price || 0).toLocaleString()}
							</Text>
							{product.quantity !== undefined && (
								<Text fontSize="sm" fontWeight="700" color="gray.700">
									{product.quantity} units
								</Text>
							)}
						</HStack>
					</VStack>
				</Box>
				
				{/* Action Buttons - Fixed at bottom */}
				<HStack spacing={2} mt="auto" pt={3} borderTop="1px solid" borderColor="gray.100">
					<Button 
						size="sm" 
						leftIcon={<FaPenToSquare size="12px" />}
						variant="ghost" 
						colorScheme="blue"
						flex={1}
						onClick={() => openEditModal(product)}
						borderRadius="md"
						fontSize="xs"
						fontWeight="600"
						_hover={{ bg: "blue.50", transform: "scale(1.02)" }}
						transition="all 0.2s"
						py={2}
					>
						Edit
					</Button>
					<Button
						size="sm"
						leftIcon={<FaTrash size="12px" />}
						variant="ghost"
						colorScheme="red"
						isLoading={deletingProductId === (product._id || product.id)}
						onClick={() => handleDeleteProduct(product)}
						flex={1}
						borderRadius="md"
						fontSize="xs"
						fontWeight="600"
						_hover={{ bg: "red.50", transform: "scale(1.02)" }}
						transition="all 0.2s"
						py={2}
					>
						Delete
					</Button>
				</HStack>
			</CardBody>
		</Card>
	);

	const filteredRequests = useMemo(() => {
		if (requestStatusFilter === "all") {
			return requests;
		}
		return requests.filter(request => {
			const displayStatus = request.paymentConfirmed === true && request.status === 'approved' ? 'approved' : request.status;
			return displayStatus === requestStatusFilter;
		});
	}, [requests, requestStatusFilter]);

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }} gap={6}>
			<Tabs variant="enclosed" colorScheme="yellow">
				<TabList>
					<Tab gap={2}>
						<FaBoxOpen /> Products
					</Tab>
					<Tab gap={2}>
						<FaClipboardList /> Requests
					</Tab>
				</TabList>
				<TabPanels>
					<TabPanel px={0}>
						<Flex justify="space-between" align="center" mb={6}>
							<Box>
								<Text fontSize="3xl" fontWeight="bold" color="gray.800" mb={1}>
									Product Catalogue
								</Text>
								<Text fontSize="sm" color="gray.500">
									Manage your product inventory
								</Text>
							</Box>
							<Button 
								leftIcon={<FaPlus />} 
								colorScheme="yellow" 
								onClick={openCreateModal}
								size="lg"
								borderRadius="lg"
								shadow="md"
								_hover={{ shadow: "lg" }}
							>
								Add Product
							</Button>
						</Flex>
						{loadingProducts ? (
							<Flex justify="center" align="center" minH="400px">
								<VStack spacing={4}>
									<Spinner size="xl" color="yellow.500" thickness="4px" />
									<Text color="gray.500">Loading products...</Text>
								</VStack>
							</Flex>
						) : products.length === 0 ? (
							<Flex 
								justify="center" 
								align="center" 
								minH="400px"
								bg="gray.50"
								borderRadius="xl"
								border="2px dashed"
								borderColor="gray.200"
							>
								<VStack spacing={4}>
									<FaBoxOpen size="64px" color="gray" />
									<Text fontSize="lg" color="gray.600" fontWeight="600">
										No products yet
									</Text>
									<Text fontSize="sm" color="gray.500">
										Get started by adding your first product
									</Text>
									<Button 
										leftIcon={<FaPlus />} 
										colorScheme="yellow" 
										onClick={openCreateModal}
										mt={2}
									>
										Add Product
									</Button>
								</VStack>
							</Flex>
						) : (
							<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={6}>
								{products.map(renderProductCard)}
							</Grid>
						)}
					</TabPanel>

					<TabPanel px={0}>
						<SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
							<Card border="1px solid" borderColor="gray.200" borderRadius="xl" bg="orange.50">
								<CardBody>
									<Text fontSize="sm" color="gray.600" fontWeight="600">
										Pending Requests
									</Text>
									<Text fontSize="3xl" fontWeight="700" color="orange.600">
										{pendingCount}
									</Text>
								</CardBody>
							</Card>
							<Card border="1px solid" borderColor="gray.200" borderRadius="xl" bg="green.50">
								<CardBody>
									<Text fontSize="sm" color="gray.600" fontWeight="600">
										Approved
									</Text>
									<Text fontSize="3xl" fontWeight="700" color="green.600">
										{requests.filter((r) => {
											const displayStatus = r.paymentConfirmed === true && r.status === 'approved' ? 'approved' : r.status;
											return displayStatus === "approved";
										}).length}
									</Text>
								</CardBody>
							</Card>
						</SimpleGrid>
						<Flex gap={3} flexWrap="wrap" mb={4}>
							{["all", "pending", "approved"].map((status) => (
								<Button
									key={status}
									variant={requestStatusFilter === status ? "solid" : "outline"}
									colorScheme={status === "pending" ? "orange" : status === "approved" ? "green" : "gray"}
									onClick={() => setRequestStatusFilter(status)}
									size="sm"
								>
									{status.charAt(0).toUpperCase() + status.slice(1)}
								</Button>
							))}
						</Flex>
						{loadingRequests ? (
							<Flex justify="center" align="center" minH="200px">
								<Spinner size="lg" />
							</Flex>
						) : (
							<VStack spacing={5} align="stretch">
								{filteredRequests.map((request) => {
									const totalValue = (request.productId?.price || 0) * request.quantity;
									const displayStatus = request.paymentConfirmed === true && request.status === 'approved' ? 'approved' : request.status;
									const isApproved = displayStatus === 'approved';
									
									return (
										<Card 
											key={request._id || request.id} 
											border="2px solid" 
											borderColor={isApproved ? "green.200" : "orange.200"} 
											borderRadius="2xl" 
											shadow="lg"
											_hover={{ 
												shadow: "2xl", 
												transform: "translateY(-3px)",
												borderColor: isApproved ? "green.400" : "orange.400"
											}}
											transition="all 0.3s ease"
											overflow="hidden"
											bg="white"
											position="relative"
										>
											<CardBody p={6}>
												{/* Product Header Section */}
												<Flex justify="space-between" align="flex-start" mb={4} gap={3}>
													<HStack spacing={4} flex={1} align="flex-start">
														{request.productId?.image && (
															<Box
																w="100px"
																h="100px"
																borderRadius="xl"
																overflow="hidden"
																border="3px solid"
																borderColor="gray.200"
																flexShrink={0}
																bg="gray.100"
																shadow="md"
																_hover={{ 
																	transform: "scale(1.05)",
																	transition: "transform 0.2s"
																}}
															>
																<Image
																	src={request.productId.image}
																	alt={request.productId?.name || "Product"}
																	w="100%"
																	h="100%"
																	objectFit="cover"
																/>
															</Box>
														)}
														<Box flex={1} minW={0}>
															<Flex justify="space-between" align="flex-start" gap={2} mb={3}>
																<Box flex={1} pr={2} minW={0}>
																	<Text 
																		fontWeight="700" 
																		fontSize="sm" 
																		color="gray.800"
																		lineHeight="1.4"
																		whiteSpace="nowrap"
																		overflow="hidden"
																		textOverflow="ellipsis"
																		title={request.productId?.name || "Product"}
																	>
																		{request.productId?.name || "Product"}
																	</Text>
																</Box>
																<Badge 
																	colorScheme={statusColors[displayStatus] || statusColors.pending} 
																	fontSize="xs" 
																	px={3} 
																	py={1.5} 
																	borderRadius="full"
																	fontWeight="700"
																	textTransform="capitalize"
																	flexShrink={0}
																	ml={2}
																	shadow="sm"
																>
																	{displayStatus}
																</Badge>
															</Flex>
															<VStack align="stretch" spacing={3}>
																<HStack spacing={4} flexWrap="wrap" mb={1}>
																	<HStack spacing={1.5} bg="gray.50" px={2} py={1} borderRadius="md">
																		<FaCartShopping size="13px" color="gray.600" />
																		<Text fontSize="xs" color="gray.700" fontWeight="600">
																			Qty: <Text as="span" fontWeight="700" color="gray.800">{request.quantity}</Text>
																		</Text>
																	</HStack>
																	<HStack spacing={1.5} bg="gray.50" px={2} py={1} borderRadius="md">
																		<Text fontSize="xs" color="gray.700" fontWeight="600">
																			Unit: <Text as="span" fontWeight="700" color="gray.800">₦{Number(request.productId?.price || 0).toLocaleString()}</Text>
																		</Text>
																	</HStack>
																</HStack>
																<Box 
																	bg="linear-gradient(135deg, #FED7AA 0%, #FFF5E6 100%)"
																	borderRadius="lg" 
																	px={4} 
																	py={3}
																	border="2px solid"
																	borderColor="orange.300"
																	display="inline-flex"
																	alignSelf="flex-start"
																	shadow="sm"
																>
																	<Text fontSize="lg" fontWeight="800" color="orange.700">
																		Total: ₦{Number(totalValue).toLocaleString()}
																	</Text>
																</Box>
															</VStack>
														</Box>
													</HStack>
												</Flex>
												
												<Divider my={4} borderColor="gray.300" borderWidth="1px" />
												
												{/* Agent and Date Info */}
												<Flex gap={3} mb={4} flexWrap="wrap">
													<Box 
														bg="linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)"
														borderRadius="xl" 
														p={4}
														border="2px solid"
														borderColor="blue.200"
														shadow="sm"
														_hover={{ shadow: "md", transform: "translateY(-1px)" }}
														transition="all 0.2s"
														flex="0 1 auto"
														minW="220px"
														maxW="280px"
													>
														<HStack spacing={2} mb={3}>
															<Box bg="blue.500" borderRadius="full" p={2} shadow="sm">
																<FaUser size="14px" color="white" />
															</Box>
															<Text fontSize="xs" color="blue.700" fontWeight="700" textTransform="uppercase" letterSpacing="1px">
																Agent
															</Text>
														</HStack>
														<VStack align="flex-start" spacing={1.5}>
															<Text fontSize="sm" fontWeight="700" color="gray.800" lineHeight="1.4">
																{request.agentId?.firstName || ""} {request.agentId?.lastName || ""}
															</Text>
															{request.agentId?.afriId && (
																<Text fontSize="xs" color="gray.600" fontWeight="600">
																	ID: {request.agentId.afriId}
																</Text>
															)}
														</VStack>
													</Box>
													
													<Box 
														bg="linear-gradient(135deg, #E9D5FF 0%, #F3E8FF 100%)"
														borderRadius="xl" 
														p={4}
														border="2px solid"
														borderColor="purple.200"
														shadow="sm"
														_hover={{ shadow: "md", transform: "translateY(-1px)" }}
														transition="all 0.2s"
														flex="0 1 auto"
														minW="220px"
														maxW="280px"
													>
														<HStack spacing={2} mb={3}>
															<Box bg="purple.500" borderRadius="full" p={2} shadow="sm">
																<FaCalendar size="14px" color="white" />
															</Box>
															<Text fontSize="xs" color="purple.700" fontWeight="700" textTransform="uppercase" letterSpacing="1px">
																Requested
															</Text>
														</HStack>
														<VStack align="flex-start" spacing={1.5}>
															<Text fontSize="sm" fontWeight="700" color="gray.800" lineHeight="1.4">
																{new Date(request.requestedAt).toLocaleDateString()}
															</Text>
															<Text fontSize="xs" color="gray.600" fontWeight="600">
																{new Date(request.requestedAt).toLocaleTimeString()}
															</Text>
														</VStack>
													</Box>
												</Flex>
												{/* Payment Information Section */}
												{(request.paymentReceipt || request.paymentAmount) ? (
													<Box 
														bg={request.paymentConfirmed === true 
															? "linear-gradient(135deg, #C6F6D5 0%, #F0FFF4 100%)" 
															: "linear-gradient(135deg, #FEFCBF 0%, #FFFBEB 100%)"
														}
														p={5} 
														borderRadius="xl" 
														mb={4} 
														border="2px solid" 
														borderColor={request.paymentConfirmed === true ? "green.400" : "yellow.400"}
														shadow="md"
													>
														<Flex justify="space-between" align="center" mb={3}>
															<HStack spacing={2}>
																<Box 
																	bg={request.paymentConfirmed === true ? "green.500" : "yellow.500"} 
																	borderRadius="full" 
																	p={2}
																	display="flex"
																	alignItems="center"
																	justifyContent="center"
																>
																	<FaCircleCheck 
																		size="14px" 
																		color="white" 
																	/>
																</Box>
																<Text 
																	fontSize="sm" 
																	color={request.paymentConfirmed === true ? "green.800" : "yellow.800"} 
																	fontWeight="700"
																>
																	Payment Information
																</Text>
															</HStack>
															{request.paymentConfirmed === true ? (
																<Badge 
																	colorScheme="green" 
																	fontSize="xs" 
																	px={3} 
																	py={1}
																	borderRadius="full"
																	fontWeight="600"
																>
																	Confirmed
																</Badge>
															) : (
																<Badge 
																	colorScheme="yellow" 
																	fontSize="xs" 
																	px={3} 
																	py={1}
																	borderRadius="full"
																	fontWeight="600"
																>
																	Awaiting Confirmation
																</Badge>
															)}
														</Flex>
														
														{request.paymentReceipt && (
															<Box mb={3}>
																<Text fontSize="xs" color="gray.700" mb={2} fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
																	Payment Receipt
																</Text>
																<Box
																	borderRadius="lg"
																	overflow="hidden"
																	border="2px solid"
																	borderColor={request.paymentConfirmed === true ? "green.200" : "yellow.200"}
																	cursor="pointer"
																	onClick={() => window.open(request.paymentReceipt, "_blank")}
																	_hover={{ 
																		borderColor: request.paymentConfirmed === true ? "green.400" : "yellow.400",
																		transform: "scale(1.01)",
																		shadow: "md"
																	}}
																	transition="all 0.2s ease"
																	bg="white"
																>
																	<Image
																		src={request.paymentReceipt}
																		alt="Payment Receipt"
																		maxH="250px"
																		w="100%"
																		objectFit="contain"
																		bg="white"
																		p={2}
																	/>
																</Box>
															</Box>
														)}
														
														{request.paymentAmount && (
															<Box 
																bg={request.paymentConfirmed === true ? "green.100" : "yellow.100"} 
																borderRadius="lg" 
																p={3} 
																mb={request.paymentConfirmed !== true && request.paymentReceipt ? 3 : 0}
																border="1px solid"
																borderColor={request.paymentConfirmed === true ? "green.200" : "yellow.200"}
															>
																<Text 
																	fontSize="md" 
																	color={request.paymentConfirmed === true ? "green.700" : "yellow.700"} 
																	fontWeight="700"
																>
																	Amount Paid: ₦{Number(request.paymentAmount).toLocaleString()}
																</Text>
															</Box>
														)}
														
														{/* Confirm Payment Button - Show when payment not confirmed */}
														{request.paymentConfirmed !== true && request.paymentReceipt && (
															<Button
																size="md"
																colorScheme="green"
																leftIcon={<FaCircleCheck size="14px" />}
																onClick={() => handleConfirmPayment(request)}
																isLoading={actionLoading}
																width="100%"
																mt={3}
																borderRadius="lg"
																fontWeight="600"
																shadow="md"
																_hover={{ shadow: "lg", transform: "translateY(-1px)" }}
																transition="all 0.2s"
															>
																Confirm Payment
															</Button>
														)}
														
														{/* Approve Button - Show when payment is confirmed but request not approved */}
														{request.paymentConfirmed === true && request.status !== 'approved' && (
															<Button
																size="md"
																colorScheme="blue"
																leftIcon={<FaCircleCheck size="14px" />}
																onClick={() => handleApproveRequest(request)}
																isLoading={actionLoading}
																width="100%"
																mt={3}
																borderRadius="lg"
																fontWeight="600"
																shadow="md"
																_hover={{ shadow: "lg", transform: "translateY(-1px)" }}
																transition="all 0.2s"
															>
																Approve Request
															</Button>
														)}
														
														{request.paymentConfirmed === true && request.paymentConfirmedAt && (
															<HStack spacing={2} mt={3} pt={3} borderTop="1px solid" borderColor={request.paymentConfirmed === true ? "green.200" : "yellow.200"}>
																<FaCircleCheck size="14px" color="#22543D" />
																<Text fontSize="xs" color="green.700" fontWeight="600">
																	Payment confirmed on {new Date(request.paymentConfirmedAt).toLocaleString()}
																</Text>
															</HStack>
														)}
													</Box>
												) : (
													<Box 
														bg="linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)"
														p={6} 
														borderRadius="xl" 
														mb={4} 
														border="2px dashed" 
														borderColor="gray.300"
														textAlign="center"
														shadow="sm"
													>
														<Box 
															bg="gray.200" 
															borderRadius="full" 
															w="60px" 
															h="60px" 
															display="flex" 
															alignItems="center" 
															justifyContent="center"
															mx="auto"
															mb={3}
														>
															<FaCircleCheck size="24px" color="gray.500" />
														</Box>
														<Text fontSize="sm" color="gray.700" fontWeight="700" mb={1}>
															No Payment Information Available
														</Text>
														<Text fontSize="xs" color="gray.500" lineHeight="1.6">
															This request does not have payment details yet.
														</Text>
													</Box>
												)}
												
												{request.adminNotes && (
													<Box 
														bg="indigo.50" 
														p={4} 
														borderRadius="xl" 
														mb={4}
														border="1px solid"
														borderColor="indigo.200"
													>
														<Text fontSize="xs" color="indigo.700" fontWeight="700" mb={2} textTransform="uppercase">
															Admin Notes
														</Text>
														<Text fontSize="sm" color="gray.700" lineHeight="1.6">
															{request.adminNotes}
														</Text>
													</Box>
												)}
											</CardBody>
										</Card>
									);
								})}
							</VStack>
						)}
					</TabPanel>
				</TabPanels>
			</Tabs>

			{/* Product Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="lg">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>{editingProduct ? "Edit Product" : "Add Product"}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4}>
							<Input
								placeholder="Name"
								value={productForm.name}
								onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
							/>
							<Textarea
								placeholder="Description"
								value={productForm.description}
								onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
							/>
							<Input
								placeholder="Image URL"
								value={productForm.image}
								onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
							/>
							<InputGroup>
								<InputLeftAddon children="₦" />
								<Input
									type="number"
									placeholder="Price"
									value={productForm.price}
									onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
								/>
							</InputGroup>
							<Input
								type="number"
								placeholder="Quantity (optional)"
								value={productForm.quantity}
								onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
							/>
							<HStack w="100%" justify="space-between">
								<Text fontWeight="600">Active</Text>
								<Switch
									isChecked={productForm.isActive}
									onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
								/>
							</HStack>
						</VStack>
					</ModalBody>
					<ModalFooter gap={3}>
						<Button variant="ghost" onClick={onClose}>
							Cancel
						</Button>
						<Button colorScheme="yellow" onClick={handleSaveProduct} isLoading={savingProduct}>
							Save
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

		</Flex>
	);
};

export default ShopAdmin;

