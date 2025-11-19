import {
	Flex,
	Spinner,
	Button,
	Text,
	useToast,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
	VStack,
	Box,
	Badge,
	Grid,
	GridItem,
	Image,
	SimpleGrid,
	HStack,
	Avatar,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	Tabs as ModalTabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Icon,
} from "@chakra-ui/react";
import { FaWifi, FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect, Fragment } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import axios from "axios";
import {
	AdminGetRemovedApartmentsAPI,
	AdminGetApprovedApartmentByIdAPI,
} from "../../../Endpoints";

const RemovedApartments = () => {
	const [loading, setLoading] = useState(false);
	const [removedApartments, setRemovedApartments] = useState([]);
	const [selectedApartment, setSelectedApartment] = useState(null);
	const [apartmentDetailsLoading, setApartmentDetailsLoading] = useState(null);
	const [selectedMedia, setSelectedMedia] = useState(null);
	const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
	const [allMedia, setAllMedia] = useState([]);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isMediaViewerOpen, onOpen: onMediaViewerOpen, onClose: onMediaViewerClose } = useDisclosure();
	const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
	const toast = useToast();

	const fetchRemovedApartments = async (page = 1) => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			const response = await axios.get(AdminGetRemovedApartmentsAPI, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				params: {
					page,
					limit: 50,
				},
			});

			if (response.data?.success && response.data?.apartments) {
				const mapped = response.data.apartments.map((apt, index) => ({
					id: apt._id,
					sn: (page - 1) * 50 + index + 1,
					apartmentName: apt.apartmentName,
					apartmentAddress: `${apt.address}, ${apt.city}, ${apt.state}`,
					agentName: apt.agentId ? `${apt.agentId.firstName} ${apt.agentId.lastName}` : "No Agent",
					agentEmail: apt.agentId?.email || "N/A",
					agentPhone: apt.agentId?.phone ? `+${apt.agentId.phone}` : "N/A",
					status: apt.status,
					removedAt: apt.statusHistory?.find(h => h.status === "removed")?.changedAt || apt.lastReviewedAt || apt.updatedAt,
					removedBy: apt.lastReviewedBy || "N/A",
					reason: apt.statusHistory?.find(h => h.status === "removed")?.reason || "N/A",
					bedrooms: apt.bedrooms,
					bathrooms: apt.bathrooms,
					guests: apt.guests,
					defaultStayFee: apt.defaultStayFee,
					city: apt.city,
					state: apt.state
				}));
				setRemovedApartments(mapped);
				setPagination(response.data.pagination || { page, limit: 50, total: 0, pages: 0 });
			} else {
				throw new Error("Failed to fetch removed apartments");
			}
		} catch (error) {
			console.error("Error fetching removed apartments:", error);
			toast({
				title: "Error",
				description: error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchApartmentDetails = async (apartmentId) => {
		setApartmentDetailsLoading(apartmentId);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			const response = await axios.get(AdminGetApprovedApartmentByIdAPI(apartmentId), {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (response.data?.apartment) {
				setSelectedApartment(response.data.apartment);
				onOpen();
			} else {
				throw new Error("Failed to fetch apartment details");
			}
		} catch (error) {
			console.error("Error fetching apartment details:", error);
			toast({
				title: "Error",
				description: error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setApartmentDetailsLoading(null);
		}
	};

	const handleViewDetails = (apartmentId) => {
		if (selectedApartment?._id === apartmentId) {
			onOpen();
		} else {
			fetchApartmentDetails(apartmentId);
		}
	};

	const openMediaViewer = (mediaUrl, mediaType, index) => {
		const images = selectedApartment.media?.images?.map(img => ({ url: img, type: 'image' })) || [];
		const videos = selectedApartment.media?.videos?.map(vid => ({ url: vid, type: 'video' })) || [];
		const combinedMedia = [...images, ...videos];

		setAllMedia(combinedMedia);
		setCurrentMediaIndex(index);
		setSelectedMedia({ url: mediaUrl, type: mediaType });
		onMediaViewerOpen();
	};

	const navigateMedia = (direction) => {
		if (direction === 'prev') {
			const newIndex = currentMediaIndex > 0 ? currentMediaIndex - 1 : allMedia.length - 1;
			setCurrentMediaIndex(newIndex);
			setSelectedMedia(allMedia[newIndex]);
		} else {
			const newIndex = currentMediaIndex < allMedia.length - 1 ? currentMediaIndex + 1 : 0;
			setCurrentMediaIndex(newIndex);
			setSelectedMedia(allMedia[newIndex]);
		}
	};

	const apartmentNameTemplate = (rowData) => {
		return (
			<HStack spacing={3}>
				<Avatar size="sm" name={rowData.apartmentName} bg="red.500" />
				<VStack align="start" spacing={0}>
					<Text fontWeight="medium" fontSize="sm">
						{rowData.apartmentName}
					</Text>
					<Text fontSize="xs" color="gray.500">
						{rowData.city}, {rowData.state}
					</Text>
				</VStack>
			</HStack>
		);
	};

	const agentTemplate = (rowData) => {
		return (
			<HStack spacing={2}>
				<Avatar size="xs" name={rowData.agentName} />
				<VStack align="start" spacing={0}>
					<Text fontSize="sm" fontWeight="medium">
						{rowData.agentName}
					</Text>
					<Text fontSize="xs" color="gray.500">
						{rowData.agentEmail}
					</Text>
				</VStack>
			</HStack>
		);
	};

	const propertyInfoTemplate = (rowData) => {
		return (
			<HStack spacing={4}>
				<HStack spacing={1}>
					<Icon as={FaBed} color="blue.500" boxSize={3} />
					<Text fontSize="xs">{rowData.bedrooms}</Text>
				</HStack>
				<HStack spacing={1}>
					<Icon as={FaBath} color="teal.500" boxSize={3} />
					<Text fontSize="xs">{rowData.bathrooms}</Text>
				</HStack>
				<HStack spacing={1}>
					<Icon as={FaUsers} color="purple.500" boxSize={3} />
					<Text fontSize="xs">{rowData.guests}</Text>
				</HStack>
			</HStack>
		);
	};

	const priceTemplate = (rowData) => {
		return (
			<Text fontSize="sm" fontWeight="bold" color="green.600">
				₦{rowData.defaultStayFee?.toLocaleString() || 'N/A'}
			</Text>
		);
	};

	const statusTemplate = (rowData) => {
		return (
			<Badge colorScheme="red" borderRadius="full" px={3} py={1}>
				Removed
			</Badge>
		);
	};

	const removedAtTemplate = (rowData) => {
		return (
			<VStack align="start" spacing={0}>
				<Text fontSize="sm" color="gray.700" fontWeight="medium">
					{rowData.removedAt ? new Date(rowData.removedAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					}) : "N/A"}
				</Text>
				{rowData.removedAt && (
					<Text fontSize="xs" color="gray.500">
						{new Date(rowData.removedAt).toLocaleTimeString('en-US', {
							hour: '2-digit',
							minute: '2-digit',
							hour12: true
						})}
					</Text>
				)}
			</VStack>
		);
	};

	const actionTemplate = (rowData) => {
		return (
			<Button
				colorScheme="blue"
				size="sm"
				variant="outline"
				isLoading={apartmentDetailsLoading === rowData.id}
				onClick={() => handleViewDetails(rowData.id)}
				borderRadius="full"
			>
				View Details
			</Button>
		);
	};

	const totalApartments = pagination.total || removedApartments.length;

	useEffect(() => {
		fetchRemovedApartments(1);
	}, []);

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading && removedApartments.length === 0 ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<Spinner size="xl" />
				</Flex>
			) : (
				<Fragment>
					{/* Statistics Card */}
					<Card p="20px" bg="linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)" color="white" mb="30px">
						<Stat>
							<StatLabel fontSize="md" opacity={0.8}>Total Removed</StatLabel>
							<StatNumber fontSize="2xl" fontWeight="bold">{totalApartments}</StatNumber>
							<StatHelpText fontSize="sm" opacity={0.7}>Apartments</StatHelpText>
						</Stat>
					</Card>

					{/* Main Table Card */}
					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<VStack align="start" spacing={1}>
								<Text fontSize="2xl" fontWeight="bold" color="gray.800">
									Removed Apartments
								</Text>
								<Text fontSize="md" color="gray.500">
									View all apartments that have been removed from approved listings
								</Text>
							</VStack>
						</CardHeader>

						<CardBody display={"block"}>
							<Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
								<DataTable
									value={removedApartments}
									paginator
									rows={10}
									rowsPerPageOptions={[5, 10, 25, 50]}
									emptyMessage="No removed apartments found."
									loading={loading}
									stripedRows
									rowHover
									scrollable
									scrollHeight="600px"
									globalFilterFields={['apartmentName', 'agentName', 'agentEmail', 'city', 'state']}
								>
									<Column
										field="sn"
										header="S/N"
										style={{ width: "5%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>

									<Column
										field="apartmentName"
										header="Apartment"
										body={apartmentNameTemplate}
										sortable
										filter
										filterPlaceholder="Search by name"
										style={{ width: "25%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>

									<Column
										field="agentName"
										header="Agent"
										body={agentTemplate}
										sortable
										filter
										filterPlaceholder="Search by agent"
										style={{ width: "20%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>

									<Column
										field="propertyInfo"
										header="Property Info"
										body={propertyInfoTemplate}
										style={{ width: "12%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>

									<Column
										field="defaultStayFee"
										header="Price"
										body={priceTemplate}
										sortable
										style={{ width: "10%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>

									<Column
										field="status"
										header="Status"
										body={statusTemplate}
										style={{ width: "8%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>

									<Column
										field="removedAt"
										header="Removed Date & Time"
										body={removedAtTemplate}
										sortable
										style={{ width: "12%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>

									<Column
										field="reason"
										header="Reason"
										body={(row) => (
											<Text fontSize="sm" color="gray.600" noOfLines={1} title={row.reason}>
												{row.reason || "N/A"}
											</Text>
										)}
										style={{ width: "15%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>

									<Column
										header="Actions"
										body={actionTemplate}
										style={{ width: "10%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>
								</DataTable>
							</Box>
						</CardBody>
					</Card>
				</Fragment>
			)}

			{/* Apartment Details Modal - Simplified (similar to ApprovedApartments but read-only) */}
			{selectedApartment && (
				<Modal isOpen={isOpen} onClose={onClose} size="6xl">
					<ModalOverlay />
					<ModalContent maxH="90vh" overflowY="auto">
						<ModalHeader>
							<Text fontSize="xl" fontWeight="bold" color="#de9301">
								{selectedApartment?.apartmentName || "Apartment Details"}
							</Text>
						</ModalHeader>
						<ModalCloseButton />
						<ModalBody pb={6}>
							{apartmentDetailsLoading ? (
								<Flex justify="center" align="center" h="300px">
									<Spinner size="xl" />
								</Flex>
							) : selectedApartment ? (
								<ModalTabs>
									<TabList>
										<Tab>Media</Tab>
										<Tab>Details</Tab>
										<Tab>Pricing</Tab>
										<Tab>Contact</Tab>
										<Tab>Amenities</Tab>
										<Tab>Access</Tab>
									</TabList>

									<TabPanels>
										{/* Media Tab */}
										<TabPanel>
											<VStack spacing={6} align="stretch">
												{selectedApartment.media?.images?.length > 0 && (
													<Box>
														<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
															Images ({selectedApartment.media.images.length})
														</Text>
														<SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
															{selectedApartment.media.images.map((image, index) => (
																<Box key={index} onClick={() => openMediaViewer(image, 'image', index)} cursor="pointer">
																	<Image
																		src={image}
																		alt={`Apartment image ${index + 1}`}
																		borderRadius="md"
																		objectFit="cover"
																		h="200px"
																		w="100%"
																	/>
																</Box>
															))}
														</SimpleGrid>
													</Box>
												)}

												{selectedApartment.media?.videos?.length > 0 && (
													<Box>
														<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
															Videos ({selectedApartment.media.videos.length})
														</Text>
														<SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
															{selectedApartment.media.videos.map((video, index) => (
																<video
																	key={index}
																	src={video}
																	controls
																	style={{
																		width: "100%",
																		borderRadius: "8px"
																	}}
																/>
															))}
														</SimpleGrid>
													</Box>
												)}
											</VStack>
										</TabPanel>

										{/* Details Tab */}
										<TabPanel>
											<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
												<GridItem>
													<VStack spacing={4} align="stretch">
														<Box p={4} bg="gray.50" borderRadius="md">
															<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
																Basic Information
															</Text>
															<VStack align="stretch" spacing={2}>
																<Text><strong>Apartment Name:</strong> {selectedApartment.apartmentName}</Text>
																<Text><strong>Description:</strong> {selectedApartment.description}</Text>
																<Text><strong>Address:</strong> {selectedApartment.address}</Text>
																<Text><strong>City:</strong> {selectedApartment.city}</Text>
																<Text><strong>State:</strong> {selectedApartment.state}</Text>
															</VStack>
														</Box>
													</VStack>
												</GridItem>

												<GridItem>
													<VStack spacing={4} align="stretch">
														<Box p={4} bg="gray.50" borderRadius="md">
															<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
																Property Info
															</Text>
															<VStack align="stretch" spacing={2}>
																<Text><strong>Bedrooms:</strong> {selectedApartment.bedrooms}</Text>
																<Text><strong>Bathrooms:</strong> {selectedApartment.bathrooms}</Text>
																<Text><strong>Beds:</strong> {selectedApartment.beds}</Text>
																<Text><strong>Guests:</strong> {selectedApartment.guests}</Text>
															</VStack>
														</Box>
													</VStack>
												</GridItem>
											</Grid>
										</TabPanel>

										{/* Pricing Tab */}
										<TabPanel>
											<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
												<GridItem>
													<Box p={4} bg="green.50" borderRadius="md">
														<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
															Stay Fees
														</Text>
														<VStack align="stretch" spacing={2}>
															<Text fontSize="2xl" fontWeight="bold" color="green.600">
																₦{selectedApartment.defaultStayFee?.toLocaleString() || 'N/A'}
															</Text>
															<Text><strong>Default Stay Fee</strong></Text>
															<Text><strong>Caution Fee:</strong> ₦{selectedApartment.cautionFee?.toLocaleString() || 'N/A'}</Text>
														</VStack>
													</Box>
												</GridItem>
											</Grid>
										</TabPanel>

										{/* Contact Tab */}
										<TabPanel>
											<Box p={4} bg="gray.50" borderRadius="md">
												<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
													Contact Information
												</Text>
												{selectedApartment.contact_details && (
													<VStack align="stretch" spacing={3}>
														<Text><strong>Contact Person:</strong> {selectedApartment.contact_details.contactPersonName || "N/A"}</Text>
														<Text><strong>Phone:</strong> {selectedApartment.contact_details.phone || "N/A"}</Text>
														<Text><strong>Alternative Phone:</strong> {selectedApartment.contact_details.alternativePhone || "N/A"}</Text>
														<Text><strong>Emergency Contact:</strong> {selectedApartment.contact_details.emergencyContact || "N/A"}</Text>
													</VStack>
												)}
											</Box>
										</TabPanel>

										{/* Amenities Tab */}
										<TabPanel>
											<Box>
												<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
													Available Amenities
												</Text>
												<SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
													{selectedApartment.amenities?.map((amenity, index) => (
														<Box key={index} p={3} bg="gray.50" borderRadius="md" textAlign="center">
															<Text fontWeight="medium">{amenity}</Text>
														</Box>
													))}
												</SimpleGrid>
											</Box>
										</TabPanel>

										{/* Access Tab */}
										<TabPanel>
											<Box p={4} bg="yellow.50" borderRadius="md">
												<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
													Access Details
												</Text>
												<Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
													<GridItem>
														<Box p={3} bg="white" borderRadius="md" border="1px solid" borderColor="yellow.300">
															<Flex align="center" mb={2}>
																<Icon as={FaWifi} color="blue.500" mr={2} />
																<Text fontWeight="bold">WiFi Code</Text>
															</Flex>
															<Text fontSize="lg" fontFamily="mono">{selectedApartment.accessDetails?.wifiCode || "N/A"}</Text>
														</Box>
													</GridItem>
													<GridItem>
														<Box p={3} bg="white" borderRadius="md" border="1px solid" borderColor="yellow.300">
															<Text fontWeight="bold" mb={2}>Door Code</Text>
															<Text fontSize="lg" fontFamily="mono">{selectedApartment.accessDetails?.doorCode || "N/A"}</Text>
														</Box>
													</GridItem>
													<GridItem>
														<Box p={3} bg="white" borderRadius="md" border="1px solid" borderColor="yellow.300">
															<Text fontWeight="bold" mb={2}>Access Code</Text>
															<Text fontSize="lg" fontFamily="mono">{selectedApartment.accessDetails?.accessCode || "N/A"}</Text>
														</Box>
													</GridItem>
												</Grid>
											</Box>
										</TabPanel>
									</TabPanels>
								</ModalTabs>
							) : (
								<Text>No details available</Text>
							)}
						</ModalBody>

						<ModalFooter>
							<Button colorScheme="blue" onClick={onClose}>
								Close
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}

			{/* Media Viewer Modal */}
			<Modal
				isOpen={isMediaViewerOpen}
				onClose={onMediaViewerClose}
				size="full"
				isCentered
			>
				<ModalOverlay />
				<ModalContent bg="black" color="white">
					<ModalHeader>
						<Flex justify="space-between" align="center">
							<Text>Media Viewer</Text>
							<Text fontSize="sm" opacity={0.7}>
								{currentMediaIndex + 1} / {allMedia.length}
							</Text>
						</Flex>
					</ModalHeader>
					<ModalCloseButton />

					<ModalBody position="relative" display="flex" alignItems="center" justifyContent="center" minH="80vh">
						{allMedia.length > 1 && (
							<>
								<Button
									position="absolute"
									left="20px"
									top="50%"
									transform="translateY(-50%)"
									leftIcon={<Icon as={FaChevronLeft} />}
									bg="blackAlpha.600"
									color="white"
									size="lg"
									borderRadius="full"
									zIndex={10}
									onClick={() => navigateMedia('prev')}
								>
									Prev
								</Button>

								<Button
									position="absolute"
									right="20px"
									top="50%"
									transform="translateY(-50%)"
									rightIcon={<Icon as={FaChevronRight} />}
									bg="blackAlpha.600"
									color="white"
									size="lg"
									borderRadius="full"
									zIndex={10}
									onClick={() => navigateMedia('next')}
								>
									Next
								</Button>
							</>
						)}

						{selectedMedia && (
							<Box maxW="90vw" maxH="90vh" display="flex" alignItems="center" justifyContent="center">
								{selectedMedia.type === 'image' ? (
									<Image
										src={selectedMedia.url}
										alt="Apartment media"
										maxW="100%"
										maxH="100%"
										objectFit="contain"
										borderRadius="md"
									/>
								) : (
									<video
										src={selectedMedia.url}
										controls
										autoPlay
										style={{
											maxWidth: "100%",
											maxHeight: "100%",
											borderRadius: "8px"
										}}
									/>
								)}
							</Box>
						)}
					</ModalBody>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default RemovedApartments;

