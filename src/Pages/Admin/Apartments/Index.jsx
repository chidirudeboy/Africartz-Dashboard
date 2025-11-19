import {
	Card,
	CardHeader,
	Flex,
	Spinner,
	Button,
	Tabs,
	Text,
	useToast,
	HStack,
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
	Divider,
	Tag,
	Wrap,
	WrapItem,
	Icon,
	Stack,
	AspectRatio,
	Tabs as ModalTabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Textarea,
	FormControl,
	FormLabel,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
} from "@chakra-ui/react";
import { FaWifi, FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import {
	AdminGetPendingApartmentsAPI,
	AdminGetPendingApartmentByIdAPI,
	AdminApprovedApartment,
	AdminRejectApartment,
} from "../../../Endpoints";

const Index = () => {
	const [loading, setLoading] = useState(false);
	const [statusLoadingId, setStatusLoadingId] = useState(null);
	const [apartments, setApartments] = useState([]);
	const [selectedApartment, setSelectedApartment] = useState(null);
	const [apartmentDetailsLoading, setApartmentDetailsLoading] = useState(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [approvalNote, setApprovalNote] = useState("");
	const [selectedMedia, setSelectedMedia] = useState(null);
	const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
	const [allMedia, setAllMedia] = useState([]);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isRejectDialogOpen, onOpen: onRejectDialogOpen, onClose: onRejectDialogClose } = useDisclosure();
	const { isOpen: isApprovalDialogOpen, onOpen: onApprovalDialogOpen, onClose: onApprovalDialogClose } = useDisclosure();
	const { isOpen: isMediaViewerOpen, onOpen: onMediaViewerOpen, onClose: onMediaViewerClose } = useDisclosure();
	const cancelRef = React.useRef();
	const toast = useToast();

	const fetchPendingApartments = async () => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			const response = await axios.get(AdminGetPendingApartmentsAPI, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (response.data?.apartments) {
				const mapped = response.data.apartments.map((apt, index) => ({
					id: apt._id, // apartment ID
					sn: index + 1,
					apartmentName: apt.apartmentName,
					apartmentAddress: `${apt.address}, ${apt.city}, ${apt.state}`,
					agentName: apt.agentId ? `${apt.agentId.firstName} ${apt.agentId.lastName}` : "No Agent",
					agentEmail: apt.agentId?.email || "N/A",
					agentPhone: apt.agentId?.phone ? `+${apt.agentId.phone}` : "N/A",
					status: apt.status,
					submittedAt: apt.createdAt || apt.submittedAt || apt.updatedAt,
				}));
				setApartments(mapped);
			} else {
				throw new Error("Failed to fetch apartments");
			}
		} catch (error) {
			console.error("Error fetching apartments:", error);
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

			const response = await axios.get(AdminGetPendingApartmentByIdAPI(apartmentId), {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (response.data?.apartment) {
				setSelectedApartment(response.data.apartment);
				onOpen();
				console.log("Apartment details fetched successfully:", response.data.apartment);

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
		fetchApartmentDetails(apartmentId);
	};

	const handleStatusChange = async (apartmentId, action, note = null) => {
		setStatusLoadingId(apartmentId);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			const endpoint = AdminApprovedApartment(apartmentId); // Both approval and rejection use the same endpoint

			const requestBody = {
				status: action === "approve" ? "approved" : "rejected",
				reason: note || ""
			};

			await axios.patch(endpoint, requestBody, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			toast({
				title: `Apartment ${action === "approve" ? "approved" : "rejected"}`,
				status: "success",
				duration: 4000,
				isClosable: true,
			});

			// Refetch updated list
			fetchPendingApartments();
			
			// Close modals and reset rejection reason
			onClose();
			if (action === "reject") {
				onRejectDialogClose();
				setRejectionReason("");
			}
		} catch (error) {
			console.error(`Error trying to ${action} apartment:`, error);
			toast({
				title: "Error",
				description: error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setStatusLoadingId(null);
		}
	};

	const handleRejectApartment = () => {
		if (!rejectionReason.trim()) {
			toast({
				title: "Error",
				description: "Please provide a reason for rejection",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}
		handleStatusChange(selectedApartment._id, "reject", rejectionReason);
		setRejectionReason("");
		onRejectDialogClose();
	};

	const handleApproveApartment = () => {
		if (!approvalNote.trim()) {
			toast({
				title: "Error",
				description: "Please provide a reason/note for approval",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}
		handleStatusChange(selectedApartment._id, "approve", approvalNote);
		setApprovalNote("");
		onApprovalDialogClose();
	};

	const openMediaViewer = (mediaUrl, mediaType, index) => {
		// Combine all media into one array for navigation
		const images = selectedApartment.media?.images?.map(img => ({ url: img, type: 'image' })) || [];
		const videos = selectedApartment.media?.videos?.map(vid => ({ url: vid, type: 'video' })) || [];
		const combinedMedia = [...images, ...videos];
		
		setAllMedia(combinedMedia);
		setCurrentMediaIndex(index);
		setSelectedMedia({ url: mediaUrl, type: mediaType });
		onMediaViewerOpen();
	};

	const navigateMedia = (direction) => {
		const newIndex = direction === 'next' 
			? (currentMediaIndex + 1) % allMedia.length
			: (currentMediaIndex - 1 + allMedia.length) % allMedia.length;
		
		setCurrentMediaIndex(newIndex);
		setSelectedMedia(allMedia[newIndex]);
	};


	useEffect(() => {
		fetchPendingApartments();
	}, []);

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<Spinner size="xl" />
				</Flex>
			) : (
				<Tabs isFitted variant="enclosed">
					<Card p="16px" mt="20px" w="100%">
						<CardHeader>
							<Flex justify="space-between" align="center" minHeight="60px" w="100%">
								<Text fontSize="lg" color={"#de9301"} fontWeight="bold">
									Incoming Apartments
								</Text>
							</Flex>
						</CardHeader>

						<Card display="block">
							<DataTable
								value={apartments}
								paginator
								rows={5}
								rowsPerPageOptions={[5, 10, 25, 50]}
							>
								<Column field="sn" header="S/N" style={{ width: "5%" }} />
								<Column field="apartmentName" header="Apartment Name" sortable filter />
								<Column field="apartmentAddress" header="Address" sortable filter />
								<Column field="agentName" header="Agent Name" sortable filter />
								<Column field="agentEmail" header="Agent Email" sortable filter />
								<Column field="agentPhone" header="Phone No." sortable filter />
								<Column
									field="submittedAt"
									header="Submitted Date & Time"
									body={(row) => (
										<VStack align="start" spacing={0}>
											<Text fontSize="sm" color="gray.700" fontWeight="medium">
												{row.submittedAt ? new Date(row.submittedAt).toLocaleDateString('en-US', { 
													year: 'numeric', 
													month: 'short', 
													day: 'numeric' 
												}) : "N/A"}
											</Text>
											{row.submittedAt && (
												<Text fontSize="xs" color="gray.500">
													{new Date(row.submittedAt).toLocaleTimeString('en-US', { 
														hour: '2-digit', 
														minute: '2-digit',
														hour12: true 
													})}
												</Text>
											)}
										</VStack>
									)}
									sortable
									style={{ width: "12%", padding: "16px" }}
									headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
								/>
								<Column
									field="status"
									header="Status"
									body={(row) => (
										<span style={{ textTransform: "capitalize" }}>{row.status}</span>
									)}
								/>
								<Column
									header="Actions"
									body={(row) => (
										<Button
											colorScheme="blue"
											size="sm"
											variant="outline"
											isLoading={apartmentDetailsLoading === row.id}
											onClick={() => handleViewDetails(row.id)}
										>
											View Details
										</Button>
									)}
								/>
							</DataTable>
						</Card>
					</Card>
				</Tabs>
			)}

			{/* Apartment Details Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="6xl">
				<ModalOverlay />
				<ModalContent maxH="90vh" overflowY="auto">
					<ModalHeader>
						<Flex justify="space-between" align="center">
							<VStack align="start" spacing={1}>
								<Text fontSize="xl" fontWeight="bold" color="#de9301">
									{selectedApartment?.apartmentName || "Apartment Details"}
								</Text>
								{selectedApartment && (
									<Badge
										colorScheme={selectedApartment.status === "approved" ? "green" : 
													selectedApartment.status === "rejected" ? "red" : "yellow"}
										fontSize="sm"
									>
										{selectedApartment.status?.toUpperCase()}
									</Badge>
								)}
							</VStack>
						</Flex>
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						{apartmentDetailsLoading ? (
							<Flex justify="center" align="center" h="300px">
								<Spinner size="xl" />
							</Flex>
						) : selectedApartment ? (
							<ModalTabs variant="enclosed" colorScheme="yellow">
								<TabList>
									<Tab>Media</Tab>
									<Tab>Details</Tab>
									<Tab>Amenities</Tab>
									<Tab>Pricing</Tab>
									<Tab>Contact</Tab>
									<Tab>Access</Tab>
								</TabList>

								<TabPanels>
									{/* Media Tab */}
									<TabPanel>
										<VStack spacing={6} align="stretch">
											{/* Images Gallery */}
											{selectedApartment.media?.images?.length > 0 && (
												<Box>
													<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
														Images ({selectedApartment.media.images.length})
													</Text>
													<SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
														{selectedApartment.media.images.map((image, index) => (
															<AspectRatio key={index} ratio={1}>
																<Image
																	src={image}
																	alt={`Apartment image ${index + 1}`}
																	borderRadius="md"
																	objectFit="cover"
																	cursor="pointer"
																	transition="all 0.2s"
																	_hover={{ 
																		transform: "scale(1.05)",
																		boxShadow: "lg"
																	}}
																	onClick={() => openMediaViewer(image, 'image', index)}
																/>
															</AspectRatio>
														))}
													</SimpleGrid>
												</Box>
											)}

											{/* Videos Gallery */}
											{selectedApartment.media?.videos?.length > 0 && (
												<Box>
													<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
														Videos ({selectedApartment.media.videos.length})
													</Text>
													<SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
														{selectedApartment.media.videos.map((video, videoIndex) => {
															const mediaIndex = (selectedApartment.media?.images?.length || 0) + videoIndex;
															return (
																<AspectRatio key={videoIndex} ratio={16/9} position="relative">
																	<Box
																		borderRadius="md"
																		overflow="hidden"
																		cursor="pointer"
																		transition="all 0.2s"
																		_hover={{
																			transform: "scale(1.02)",
																			boxShadow: "lg"
																		}}
																		onClick={() => openMediaViewer(video, 'video', mediaIndex)}
																	>
																		<video
																			src={video}
																			style={{ 
																				width: "100%",
																				height: "100%",
																				objectFit: "cover",
																				borderRadius: "8px"
																			}}
																		/>
																		<Box
																			position="absolute"
																			top="0"
																			left="0"
																			right="0"
																			bottom="0"
																			bg="blackAlpha.300"
																			display="flex"
																			alignItems="center"
																			justifyContent="center"
																			opacity="0"
																			_hover={{ opacity: "1" }}
																			transition="opacity 0.2s"
																		>
																			<Box
																				bg="whiteAlpha.900"
																				borderRadius="full"
																				p="3"
																				color="gray.800"
																			>
																				<Text fontSize="sm" fontWeight="bold">
																					Click to view
																				</Text>
																			</Box>
																		</Box>
																	</Box>
																</AspectRatio>
															);
														})}
													</SimpleGrid>
												</Box>
											)}

											{(!selectedApartment.media?.images?.length && !selectedApartment.media?.videos?.length) && (
												<Box textAlign="center" py={8}>
													<Text color="gray.500">No media available for this apartment</Text>
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
														<Stack spacing={3}>
															<Flex align="center">
																<Icon as={FaMapMarkerAlt} color="red.500" mr={2} />
																<Text>
																	<strong>Address:</strong> {selectedApartment.address}, {selectedApartment.city}, {selectedApartment.state}
																</Text>
															</Flex>
															<Flex align="center">
																<Icon as={FaBed} color="blue.500" mr={2} />
																<Text><strong>Bedrooms:</strong> {selectedApartment.bedrooms}</Text>
															</Flex>
															<Flex align="center">
																<Icon as={FaBath} color="teal.500" mr={2} />
																<Text><strong>Bathrooms:</strong> {selectedApartment.bathrooms}</Text>
															</Flex>
															<Flex align="center">
																<Text><strong>Beds:</strong> {selectedApartment.beds}</Text>
															</Flex>
															<Flex align="center">
																<Icon as={FaUsers} color="purple.500" mr={2} />
																<Text><strong>Guests:</strong> {selectedApartment.guests}</Text>
															</Flex>
														</Stack>
													</Box>

													<Box p={4} bg="gray.50" borderRadius="md">
														<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
															Description
														</Text>
														<Text>{selectedApartment.description || "No description available"}</Text>
													</Box>

													<Box p={4} bg="gray.50" borderRadius="md">
														<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
															Allowed Reservations
														</Text>
														<Wrap>
															{selectedApartment.allowedReservations?.map((type, index) => (
																<WrapItem key={index}>
																	<Tag colorScheme="blue" textTransform="capitalize">
																		{type}
																	</Tag>
																</WrapItem>
															))}
														</Wrap>
													</Box>
												</VStack>
											</GridItem>

											<GridItem>
												<VStack spacing={4} align="stretch">
													{/* Agent Information */}
													{selectedApartment.agentId && (
														<Box p={4} bg="blue.50" borderRadius="md">
															<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
																Agent Information
															</Text>
															<Stack spacing={2}>
																<Text><strong>Name:</strong> {selectedApartment.agentId.firstName} {selectedApartment.agentId.lastName}</Text>
																<Text><strong>Email:</strong> {selectedApartment.agentId.email}</Text>
																<Text><strong>Afri ID:</strong> {selectedApartment.agentId.afriId}</Text>
																<Text><strong>Role:</strong> {selectedApartment.agentId.role}</Text>
															</Stack>
														</Box>
													)}

													<Box p={4} bg="gray.50" borderRadius="md">
														<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
															Property Info
														</Text>
														<Stack spacing={2}>
															<Text><strong>Created:</strong> {new Date(selectedApartment.createdAt).toLocaleDateString()}</Text>
															<Text><strong>Last Modified:</strong> {new Date(selectedApartment.lastModifiedAt).toLocaleDateString()}</Text>
															<Text><strong>Is Booked:</strong> {selectedApartment.isBooked ? "Yes" : "No"}</Text>
															<Text><strong>Can Be Pushed:</strong> {selectedApartment.canBePushed ? "Yes" : "No"}</Text>
															<Text><strong>Push Count:</strong> {selectedApartment.pushCount}</Text>
														</Stack>
													</Box>

													{selectedApartment.webLink && (
														<Box p={4} bg="green.50" borderRadius="md">
															<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
																Web Link
															</Text>
															<Text 
																as="a" 
																href={selectedApartment.webLink} 
																target="_blank" 
																color="blue.500" 
																textDecoration="underline"
															>
																View Property Online
															</Text>
														</Box>
													)}
												</VStack>
											</GridItem>
										</Grid>
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

									{/* Pricing Tab */}
									<TabPanel>
										<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
											<GridItem>
												<Box p={4} bg="green.50" borderRadius="md">
													<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
														Stay Fees
													</Text>
													<Stack spacing={2}>
														<Text fontSize="2xl" fontWeight="bold" color="green.600">
															₦{selectedApartment.defaultStayFee?.toLocaleString()}
														</Text>
														<Text fontSize="sm" color="gray.600">Default Stay Fee</Text>
														<Divider />
														<Text fontSize="lg" fontWeight="bold" color="red.600">
															₦{selectedApartment.cautionFee?.toLocaleString()}
														</Text>
														<Text fontSize="sm" color="gray.600">Caution Fee</Text>
													</Stack>
												</Box>
											</GridItem>
											
											<GridItem>
												<Box p={4} bg="blue.50" borderRadius="md">
													<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
														Optional Fees
													</Text>
													<Stack spacing={2}>
														{selectedApartment.optionalFees?.partyFee && (
															<Text><strong>Party Fee:</strong> ₦{selectedApartment.optionalFees.partyFee.toLocaleString()}</Text>
														)}
														{selectedApartment.optionalFees?.movieShootFee && (
															<Text><strong>Movie Shoot Fee:</strong> ₦{selectedApartment.optionalFees.movieShootFee.toLocaleString()}</Text>
														)}
														{selectedApartment.optionalFees?.photoShootFee && (
															<Text><strong>Photo Shoot Fee:</strong> ₦{selectedApartment.optionalFees.photoShootFee.toLocaleString()}</Text>
														)}
													</Stack>
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
											<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
												<GridItem>
													<Stack spacing={3}>
														<Text><strong>Contact Person:</strong> {selectedApartment.contact_details?.contactPersonName}</Text>
														<Text><strong>Role:</strong> {selectedApartment.contact_details?.contactPersonRole}</Text>
														<Flex align="center">
															<Icon as={FaPhoneAlt} color="green.500" mr={2} />
															<Text><strong>Phone:</strong> {selectedApartment.contact_details?.phone}</Text>
														</Flex>
														<Flex align="center">
															<Icon as={FaWhatsapp} color="green.500" mr={2} />
															<Text><strong>WhatsApp:</strong> {selectedApartment.contact_details?.whatsappNumber}</Text>
														</Flex>
													</Stack>
												</GridItem>
											</Grid>
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
														<Text fontSize="lg" fontFamily="mono">{selectedApartment.accessDetails?.wifiCode}</Text>
													</Box>
												</GridItem>
												<GridItem>
													<Box p={3} bg="white" borderRadius="md" border="1px solid" borderColor="yellow.300">
														<Text fontWeight="bold" mb={2}>Door Code</Text>
														<Text fontSize="lg" fontFamily="mono">{selectedApartment.accessDetails?.doorCode}</Text>
													</Box>
												</GridItem>
												<GridItem>
													<Box p={3} bg="white" borderRadius="md" border="1px solid" borderColor="yellow.300">
														<Text fontWeight="bold" mb={2}>Access Code</Text>
														<Text fontSize="lg" fontFamily="mono">{selectedApartment.accessDetails?.accessCode}</Text>
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
						<HStack spacing={3}>
							<Button colorScheme="gray" onClick={onClose}>
								Close
							</Button>
							{selectedApartment && selectedApartment.status === "pending" && (
								<>
									<Button
										colorScheme="green"
										isLoading={statusLoadingId === selectedApartment._id}
										onClick={onApprovalDialogOpen}
									>
										Approve Apartment
									</Button>
									<Button
										colorScheme="red"
										variant="outline"
										isLoading={statusLoadingId === selectedApartment._id}
										onClick={onRejectDialogOpen}
									>
										Reject Apartment
									</Button>
								</>
							)}
						</HStack>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Media Viewer Modal */}
			<Modal 
				isOpen={isMediaViewerOpen} 
				onClose={onMediaViewerClose} 
				size="full"
				isCentered
			>
				<ModalOverlay bg="blackAlpha.800" />
				<ModalContent bg="transparent" boxShadow="none">
					<ModalBody p={0} display="flex" alignItems="center" justifyContent="center" position="relative">
						{/* Close Button */}
						<Button
							position="absolute"
							top="20px"
							right="20px"
							colorScheme="whiteAlpha"
							variant="solid"
							bg="blackAlpha.600"
							color="white"
							size="lg"
							borderRadius="full"
							zIndex={10}
							onClick={onMediaViewerClose}
							_hover={{
								bg: "blackAlpha.800",
								transform: "scale(1.1)"
							}}
						>
							<Icon as={FaTimes} />
						</Button>

						{/* Navigation Buttons */}
						{allMedia.length > 1 && (
							<>
								<Button
									position="absolute"
									left="20px"
									top="50%"
									transform="translateY(-50%)"
									colorScheme="whiteAlpha"
									variant="solid"
									bg="blackAlpha.600"
									color="white"
									size="lg"
									borderRadius="full"
									zIndex={10}
									onClick={() => navigateMedia('prev')}
									_hover={{
										bg: "blackAlpha.800",
										transform: "translateY(-50%) scale(1.1)"
									}}
								>
									<Icon as={FaChevronLeft} />
								</Button>

								<Button
									position="absolute"
									right="20px"
									top="50%"
									transform="translateY(-50%)"
									colorScheme="whiteAlpha"
									variant="solid"
									bg="blackAlpha.600"
									color="white"
									size="lg"
									borderRadius="full"
									zIndex={10}
									onClick={() => navigateMedia('next')}
									_hover={{
										bg: "blackAlpha.800",
										transform: "translateY(-50%) scale(1.1)"
									}}
								>
									<Icon as={FaChevronRight} />
								</Button>
							</>
						)}

						{/* Media Content */}
						{selectedMedia && (
							<Box
								maxW="90vw"
								maxH="90vh"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
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

						{/* Media Counter */}
						{allMedia.length > 1 && (
							<Box
								position="absolute"
								bottom="20px"
								left="50%"
								transform="translateX(-50%)"
								bg="blackAlpha.700"
								color="white"
								px={4}
								py={2}
								borderRadius="full"
								fontSize="sm"
								fontWeight="bold"
							>
								{currentMediaIndex + 1} of {allMedia.length}
							</Box>
						)}
					</ModalBody>
				</ModalContent>
			</Modal>

			{/* Rejection Reason Dialog */}
			<AlertDialog
				isOpen={isRejectDialogOpen}
				leastDestructiveRef={cancelRef}
				onClose={onRejectDialogClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Reject Apartment: {selectedApartment?.apartmentName}
						</AlertDialogHeader>

						<AlertDialogBody>
							<FormControl isRequired>
								<FormLabel>Reason for rejection</FormLabel>
								<Textarea
									placeholder="Please provide a detailed reason for rejecting this apartment..."
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									resize="vertical"
									minH="100px"
								/>
							</FormControl>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={() => {
								setRejectionReason("");
								onRejectDialogClose();
							}}>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								ml={3}
								isLoading={statusLoadingId === selectedApartment?._id}
								onClick={handleRejectApartment}
							>
								Reject Apartment
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			{/* Approval Note Dialog */}
			<AlertDialog
				isOpen={isApprovalDialogOpen}
				leastDestructiveRef={cancelRef}
				onClose={onApprovalDialogClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Approve Apartment: {selectedApartment?.apartmentName}
						</AlertDialogHeader>
						<AlertDialogBody>
							<FormControl isRequired>
								<FormLabel>Reason for Approval</FormLabel>
								<Textarea
									placeholder="Please provide a reason/note for approving this apartment..."
									value={approvalNote}
									onChange={(e) => setApprovalNote(e.target.value)}
									resize="vertical"
									minH="100px"
								/>
							</FormControl>
						</AlertDialogBody>
						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={() => {
								setApprovalNote("");
								onApprovalDialogClose();
							}}>
								Cancel
							</Button>
							<Button
								colorScheme="green"
								ml={3}
								isLoading={statusLoadingId === selectedApartment?._id}
								onClick={handleApproveApartment}
							>
								Approve Apartment
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Flex>
	);
};

export default Index;
