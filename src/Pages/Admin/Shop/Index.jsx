import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
	Badge,
	Box,
	Button,
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
import { FaBoxOpen, FaClipboardList, FaPlus } from "react-icons/fa6";

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

	const [actionModal, setActionModal] = useState({ isOpen: false, type: null, request: null });
	const [actionNotes, setActionNotes] = useState("");
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
				setRequests(response.data.data || []);
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

	const openRequestActionModal = (type, request) => {
		setActionModal({ isOpen: true, type, request });
		setActionNotes("");
	};

	const handleRequestAction = async () => {
		if (!actionModal.request || !actionModal.type) return;
		const requestId = actionModal.request._id || actionModal.request.id;
		const endpointMap = {
			approve: SHOP_ENDPOINTS.requests.approve(requestId),
			reject: SHOP_ENDPOINTS.requests.reject(requestId),
			fulfill: SHOP_ENDPOINTS.requests.fulfill(requestId),
		};

		setActionLoading(true);
		try {
			const payload =
				actionModal.type === "approve" || actionModal.type === "reject"
					? { adminNotes: actionNotes || undefined }
					: undefined;
			await axios.post(endpointMap[actionModal.type], payload, {
				headers: authHeadersRef.current,
			});
			toast({
				title: `Request ${actionModal.type === "fulfill" ? "fulfilled" : actionModal.type + "d"}`,
				status: "success",
				duration: 3000,
			});
			setActionModal({ isOpen: false, type: null, request: null });
			fetchRequests();
			fetchPendingCount();
		} catch (error) {
			console.error("Error updating request:", error);
			const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || `Unable to ${actionModal.type} request`;
			toast({
				title: `Error ${actionModal.type === "fulfill" ? "fulfilling" : actionModal.type + "ing"} request`,
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
		<Card key={product._id || product.id} p="16px" border="1px solid" borderColor="gray.200" borderRadius="xl">
			<CardHeader pb="12px">
				<Flex justify="space-between" align="center">
					<Text fontSize="lg" fontWeight="700">
						{product.name}
					</Text>
					<Badge colorScheme={product.isActive ? "green" : "gray"}>
						{product.isActive ? "Active" : "Inactive"}
					</Badge>
				</Flex>
			</CardHeader>
			<CardBody>
				<Text color="gray.600" mb="3">
					{product.description || "No description"}
				</Text>
				<Text fontSize="2xl" fontWeight="bold">
					₦{Number(product.price || 0).toLocaleString()}
				</Text>
				<Text color="gray.500" mt="1">
					{product.quantity !== undefined ? `${product.quantity} units available` : "Quantity not specified"}
				</Text>
				<Flex mt="4" gap={3}>
					<Button size="sm" variant="outline" onClick={() => openEditModal(product)}>
						Edit
					</Button>
					<Button
						size="sm"
						colorScheme="red"
						isLoading={deletingProductId === (product._id || product.id)}
						onClick={() => handleDeleteProduct(product)}
					>
						Delete
					</Button>
				</Flex>
			</CardBody>
		</Card>
	);

	const filteredRequests = requests;

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
						<Flex justify="space-between" align="center" mb={4}>
							<Text fontSize="2xl" fontWeight="bold">
								Product Catalogue
							</Text>
							<Button leftIcon={<FaPlus />} colorScheme="yellow" onClick={openCreateModal}>
								Add Product
							</Button>
						</Flex>
						{loadingProducts ? (
							<Flex justify="center" align="center" minH="200px">
								<Spinner size="lg" />
							</Flex>
						) : (
							<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={6}>
								{products.map(renderProductCard)}
							</Grid>
						)}
					</TabPanel>

					<TabPanel px={0}>
						<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
							<Card border="1px solid" borderColor="gray.200" borderRadius="xl">
								<CardBody>
									<Text fontSize="sm" color="gray.500">
										Pending Requests
									</Text>
									<Text fontSize="3xl" fontWeight="700">
										{pendingCount}
									</Text>
								</CardBody>
							</Card>
						</SimpleGrid>
						<Flex gap={3} flexWrap="wrap" mb={4}>
							{["all", "pending", "approved", "rejected", "fulfilled"].map((status) => (
								<Button
									key={status}
									variant={requestStatusFilter === status ? "solid" : "outline"}
									colorScheme={status === "pending" ? "yellow" : status === "approved" ? "green" : status === "rejected" ? "red" : "blue"}
									onClick={() => setRequestStatusFilter(status)}
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
							<VStack spacing={4} align="stretch">
								{filteredRequests.map((request) => (
									<Card key={request._id || request.id} border="1px solid" borderColor="gray.200" borderRadius="xl">
										<CardBody>
											<Flex justify="space-between" align="flex-start">
												<Box>
													<Text fontWeight="bold" fontSize="lg">
														{request.productId?.name || "Product"}
													</Text>
													<Text fontSize="sm" color="gray.500">
														Requested {request.quantity} units • {new Date(request.requestedAt).toLocaleDateString()}
													</Text>
												</Box>
												<Badge colorScheme={statusColors[request.status]}>
													{request.status}
												</Badge>
											</Flex>
											<Text color="gray.600" mt={3}>
												Value: ₦{Number((request.productId?.price || 0) * request.quantity).toLocaleString()}
											</Text>
											<Text color="gray.500" fontSize="sm">
												Request ID: {request._id || request.id}
											</Text>
											{request.adminNotes && (
												<Text color="gray.600" fontSize="sm" mt={2}>
													Admin notes: {request.adminNotes}
												</Text>
											)}
											<HStack spacing={3} mt={4}>
												<Button
													size="sm"
													variant="outline"
													onClick={() => openRequestActionModal("approve", request)}
													isDisabled={request.status !== "pending"}
												>
													Approve
												</Button>
												<Button
													size="sm"
													variant="outline"
													colorScheme="red"
													onClick={() => openRequestActionModal("reject", request)}
													isDisabled={request.status !== "pending"}
												>
													Reject
												</Button>
												<Button
													size="sm"
													variant="outline"
													colorScheme="blue"
													onClick={() => openRequestActionModal("fulfill", request)}
													isDisabled={request.status !== "approved"}
												>
													Mark Fulfilled
												</Button>
											</HStack>
										</CardBody>
									</Card>
								))}
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

			{/* Request Action Modal */}
			<Modal isOpen={actionModal.isOpen} onClose={() => setActionModal({ isOpen: false, type: null, request: null })}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader textTransform="capitalize">{actionModal.type} request</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Text mb={3}>
							Requesting:{" "}
							<Text as="span" fontWeight="bold">
								{actionModal.request?.productId?.name}
							</Text>
						</Text>
						{actionModal.type !== "fulfill" && (
							<Textarea
								placeholder="Optional admin notes"
								value={actionNotes}
								onChange={(e) => setActionNotes(e.target.value)}
							/>
						)}
					</ModalBody>
					<ModalFooter gap={3}>
						<Button variant="ghost" onClick={() => setActionModal({ isOpen: false, type: null, request: null })}>
							Cancel
						</Button>
						<Button
							colorScheme={actionModal.type === "reject" ? "red" : "yellow"}
							onClick={handleRequestAction}
							isLoading={actionLoading}
						>
							Confirm
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default ShopAdmin;

