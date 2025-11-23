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
	HStack,
	Avatar,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	Input,
	Textarea,
	FormControl,
	FormLabel,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	IconButton,
	Checkbox,
	CheckboxGroup,
	Select,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay
} from "@chakra-ui/react";
import { FaWifi, FaPhoneAlt, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaChevronLeft, FaChevronRight, FaTimes, FaEdit, FaTrash, FaUpload, FaCheck, FaStar, FaRegStar, FaPlus } from "react-icons/fa";
import { useState, useEffect, Fragment, useRef } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import axios from "axios";
import {
	AdminGetApprovedApartmentsAPI,
	AdminGetApprovedApartmentByIdAPI,
	AdminUpdateApartmentAPI,
	AdminRemoveApartmentAPI,
} from "../../../Endpoints";
import { APARTMENT_ENDPOINTS } from "../../../api/endpoints";
import { createUploadService } from "../../../utils/uploadService";

const ApprovedApartments = () => {
	const [loading, setLoading] = useState(false);
	const [approvedApartments, setApprovedApartments] = useState([]);
	const [selectedApartment, setSelectedApartment] = useState(null);
	const [apartmentDetailsLoading, setApartmentDetailsLoading] = useState(null);
	const [selectedMedia, setSelectedMedia] = useState(null);
	const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
	const [allMedia, setAllMedia] = useState([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editedApartment, setEditedApartment] = useState(null);
	const [updateLoading, setUpdateLoading] = useState(false);
	const [newImages, setNewImages] = useState([]);
	const [newVideos, setNewVideos] = useState([]);
	const [deletedImages, setDeletedImages] = useState([]);
	const [deletedVideos, setDeletedVideos] = useState([]);
	const [uploadingMedia, setUploadingMedia] = useState(false);
	const [validatingFiles, setValidatingFiles] = useState(false);
	const [favoriteImageIndex, setFavoriteImageIndex] = useState(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isMediaViewerOpen, onOpen: onMediaViewerOpen, onClose: onMediaViewerClose } = useDisclosure();
	const { isOpen: isRemoveDialogOpen, onOpen: onRemoveDialogOpen, onClose: onRemoveDialogClose } = useDisclosure();
	const { isOpen: isDeleteSeasonalDialogOpen, onOpen: onDeleteSeasonalDialogOpen, onClose: onDeleteSeasonalDialogClose } = useDisclosure();
	const cancelRef = useRef();
	const deleteSeasonalCancelRef = useRef();
	const [removingApartmentId, setRemovingApartmentId] = useState(null);
	const [apartmentToRemove, setApartmentToRemove] = useState(null);
	const [removeReason, setRemoveReason] = useState("");
	const toast = useToast();
	const [isSeasonalModalOpen, setSeasonalModalOpen] = useState(false);
	const [seasonalFormData, setSeasonalFormData] = useState({ name: "", additionalFee: "", startDate: "", endDate: "", isActive: true });
	const [editingSeasonalIndex, setEditingSeasonalIndex] = useState(null);
	const [isBedroomModalOpen, setBedroomModalOpen] = useState(false);
	const [bedroomFormData, setBedroomFormData] = useState({ bedrooms: "", price: "", isActive: true });
	const [editingBedroomIndex, setEditingBedroomIndex] = useState(null);
	const [seasonalPricingToDelete, setSeasonalPricingToDelete] = useState(null);
	const [deletingSeasonalPricingId, setDeletingSeasonalPricingId] = useState(null);

	const fetchApprovedApartments = async () => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			const response = await axios.get(AdminGetApprovedApartmentsAPI, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (response.data?.apartments) {
				const mapped = response.data.apartments.map((apt, index) => ({
					id: apt._id,
					sn: index + 1,
					apartmentName: apt.apartmentName,
					apartmentAddress: `${apt.address}, ${apt.city}, ${apt.state}`,
					agentName: apt.agentId ? `${apt.agentId.firstName} ${apt.agentId.lastName}` : "No Agent",
					agentEmail: apt.agentId?.email || "N/A",
					agentPhone: apt.agentId?.phone ? `+${apt.agentId.phone}` : "N/A",
					status: apt.status,
					approvedAt: apt.statusHistory?.find(h => h.status === "approved")?.timestamp || apt.updatedAt,
					approvedBy: apt.statusHistory?.find(h => h.status === "approved")?.updatedBy || "N/A",
					bedrooms: apt.bedrooms,
					bathrooms: apt.bathrooms,
					guests: apt.guests,
					defaultStayFee: apt.defaultStayFee,
					city: apt.city,
					state: apt.state
				}));
				setApprovedApartments(mapped);
			} else {
				throw new Error("Failed to fetch approved apartments");
			}
		} catch (error) {
			console.error("Error fetching approved apartments:", error);
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
				const apartmentData = { ...response.data.apartment };

				// Parse amenities - handle various formats
				if (apartmentData.amenities) {
					if (Array.isArray(apartmentData.amenities)) {
						// If it's an array, check if first element is a JSON string
						if (apartmentData.amenities.length > 0 && typeof apartmentData.amenities[0] === 'string') {
							// Check if it looks like JSON (starts with [ or {)
							const firstItem = apartmentData.amenities[0].trim();
							if (firstItem.startsWith('[') || firstItem.startsWith('{')) {
								try {
									const parsed = JSON.parse(apartmentData.amenities[0]);
									apartmentData.amenities = Array.isArray(parsed) ? parsed : [parsed];
								} catch (e) {
									// If parsing fails, it's likely already an array of strings, use as is
									console.warn("Failed to parse amenities JSON, using as array of strings:", e);
									apartmentData.amenities = apartmentData.amenities;
								}
							} else {
								// It's already an array of strings (like ["Wi-Fi", "Pool"]), use as is
								apartmentData.amenities = apartmentData.amenities;
							}
						} else {
							// Already an array of objects or mixed, use as is
							apartmentData.amenities = apartmentData.amenities;
						}
					} else if (typeof apartmentData.amenities === 'string') {
						// Check if it looks like JSON
						const trimmed = apartmentData.amenities.trim();
						if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
							try {
								const parsed = JSON.parse(apartmentData.amenities);
								apartmentData.amenities = Array.isArray(parsed) ? parsed : [parsed];
							} catch (e) {
								console.warn("Failed to parse amenities string:", e);
								apartmentData.amenities = [];
							}
						} else {
							// It's a plain string, convert to array
							apartmentData.amenities = [apartmentData.amenities];
						}
					}
				} else {
					apartmentData.amenities = [];
				}
				
				// Ensure amenities is always an array
				if (!Array.isArray(apartmentData.amenities)) {
					apartmentData.amenities = [];
				}

				// Ensure seasonalPricing is always an array
				if (!apartmentData.seasonalPricing) {
					apartmentData.seasonalPricing = [];
				} else if (!Array.isArray(apartmentData.seasonalPricing)) {
					// If it's a single object, wrap it in an array
					apartmentData.seasonalPricing = [apartmentData.seasonalPricing];
				}

				// Ensure bedroomPricing is always an array
				if (!apartmentData.bedroomPricing) {
					apartmentData.bedroomPricing = [];
				} else if (!Array.isArray(apartmentData.bedroomPricing)) {
					// If it's a single object, wrap it in an array
					apartmentData.bedroomPricing = [apartmentData.bedroomPricing];
				}

				// Fetch seasonal and bedroom pricing separately using dedicated endpoints
				try {
					const [seasonalResponse, bedroomResponse] = await Promise.all([
						axios.get(APARTMENT_ENDPOINTS.seasonalPricing.list(apartmentId), {
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${authToken}`,
							},
						}).catch(() => ({ data: { success: true, seasonalPricing: [] } })),
						axios.get(APARTMENT_ENDPOINTS.bedroomPricing.list(apartmentId), {
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${authToken}`,
							},
						}).catch(() => ({ data: { success: true, bedroomPricing: [] } }))
					]);

					// Update apartment data with fetched pricing
					if (seasonalResponse.data?.seasonalPricing) {
						apartmentData.seasonalPricing = Array.isArray(seasonalResponse.data.seasonalPricing) 
							? seasonalResponse.data.seasonalPricing 
							: [];
					}
					if (bedroomResponse.data?.bedroomPricing) {
						apartmentData.bedroomPricing = Array.isArray(bedroomResponse.data.bedroomPricing) 
							? bedroomResponse.data.bedroomPricing 
							: [];
					}

					console.log("📋 Fetched pricing data:", {
						seasonalPricing: apartmentData.seasonalPricing,
						bedroomPricing: apartmentData.bedroomPricing,
						seasonalLength: apartmentData.seasonalPricing?.length,
						bedroomLength: apartmentData.bedroomPricing?.length
					});
				} catch (error) {
					console.error("Error fetching pricing data:", error);
					// Continue with empty arrays if fetch fails
					apartmentData.seasonalPricing = apartmentData.seasonalPricing || [];
					apartmentData.bedroomPricing = apartmentData.bedroomPricing || [];
				}

				console.log("📋 Fetched apartment data:", {
					apartmentId: apartmentData._id,
					seasonalPricing: apartmentData.seasonalPricing,
					bedroomPricing: apartmentData.bedroomPricing,
					seasonalPricingLength: apartmentData.seasonalPricing?.length,
					bedroomPricingLength: apartmentData.bedroomPricing?.length
				});

				setSelectedApartment(apartmentData);
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

	const handleViewDetails = async (apartmentId, editMode = false) => {
		await fetchApartmentDetails(apartmentId);
		if (editMode) {
			// Wait a bit for selectedApartment to be set
			setTimeout(() => {
				if (selectedApartment) {
					setIsEditMode(true);
					// Ensure contact_details is properly initialized
					const apartmentCopy = {
						...selectedApartment,
						contact_details: selectedApartment.contact_details || {
							contactPersonName: "",
							contactPersonRole: "",
							phone: ""
						}
					};
					setEditedApartment(apartmentCopy);
					setFavoriteImageIndex(selectedApartment?.media?.favoriteImageIndex || null);
				}
			}, 100);
		}
	};

	const handleEditApartment = () => {
		setIsEditMode(true);
		// Ensure contact_details is properly initialized
		const apartmentCopy = {
			...selectedApartment,
			contact_details: selectedApartment.contact_details || {
				contactPersonName: "",
				contactPersonRole: "",
				phone: ""
			}
		};
		setEditedApartment(apartmentCopy);
		setFavoriteImageIndex(selectedApartment?.media?.favoriteImageIndex || null);
	};

	const handleCancelEdit = () => {
		setIsEditMode(false);
		setEditedApartment(null);
		setNewImages([]);
		setNewVideos([]);
		setDeletedImages([]);
		setDeletedVideos([]);
		setFavoriteImageIndex(null);
		closeSeasonalModal();
		closeBedroomModal();
	};

	const resetSeasonalForm = () => {
		setSeasonalFormData({ name: "", additionalFee: "", startDate: "", endDate: "", isActive: true });
		setEditingSeasonalIndex(null);
	};

	const resetBedroomForm = () => {
		setBedroomFormData({ bedrooms: "", price: "", isActive: true });
		setEditingBedroomIndex(null);
	};

	const formatDateForInput = (value) => {
		if (!value) return "";
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "";
		return date.toISOString().split("T")[0];
	};
	const formatDateLabel = (value) => {
		if (!value) return "N/A";
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
	};

	const openSeasonalModal = (pricing = null, index = null) => {
		if (!selectedApartment) return;
		setEditingSeasonalIndex(typeof index === "number" ? index : null);
		setSeasonalFormData({
			name: pricing?.name || "",
			additionalFee: pricing?.additionalFee?.toString() || "",
			startDate: formatDateForInput(pricing?.startDate),
			endDate: formatDateForInput(pricing?.endDate),
			isActive: pricing?.isActive ?? true,
		});
		setSeasonalModalOpen(true);
	};

	const handleSeasonalSave = async () => {
		if (!selectedApartment?._id) return;
		const { name, additionalFee, startDate, endDate } = seasonalFormData;

		if (!name || !additionalFee || !startDate || !endDate) {
			toast({
				title: "Validation Error",
				description: "All fields are required.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const parsedFee = parseFloat(additionalFee);
		if (parsedFee < 0) {
			toast({
				title: "Validation Error",
				description: "Additional fee must be zero or greater.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const start = new Date(startDate);
		const end = new Date(endDate);

		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
			toast({
				title: "Validation Error",
				description: "Invalid dates supplied.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (end <= start) {
			toast({
				title: "Validation Error",
				description: "End date must be after start date.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			const apartmentId = selectedApartment._id;
			const currentSeasonal = selectedApartment.seasonalPricing || [];
			const isEditing = editingSeasonalIndex !== null && editingSeasonalIndex >= 0 && editingSeasonalIndex < currentSeasonal.length;
			const pricingId = isEditing ? currentSeasonal[editingSeasonalIndex]._id : null;

			const payload = {
				name: name.trim(),
				additionalFee: parsedFee,
				startDate: start.toISOString(),
				endDate: end.toISOString(),
				isActive: seasonalFormData.isActive,
			};

			let response;
			if (isEditing && pricingId) {
				// Update existing
				response = await axios.put(
					APARTMENT_ENDPOINTS.seasonalPricing.update(apartmentId, pricingId),
					payload,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${authToken}`,
						},
					}
				);
			} else {
				// Create new
				response = await axios.post(
					APARTMENT_ENDPOINTS.seasonalPricing.create(apartmentId),
					payload,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${authToken}`,
						},
					}
				);
			}

			toast({
				title: "Success",
				description: isEditing ? "Seasonal pricing updated." : "Seasonal pricing created.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});

			// Refetch apartment details to get updated pricing
			await fetchApartmentDetails(apartmentId);
			
			setSeasonalModalOpen(false);
			resetSeasonalForm();
		} catch (error) {
			console.error("Error saving seasonal pricing:", error);
			toast({
				title: "Error",
				description: error.response?.data?.error || error.response?.data?.message || error.message || "Failed to save seasonal pricing",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
	};

	const handleDeleteSeasonal = (index, event) => {
		// Prevent event propagation
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}

		if (!selectedApartment?._id) {
			console.error("No apartment selected");
			return;
		}

		const currentSeasonal = selectedApartment.seasonalPricing || [];
		if (index < 0 || index >= currentSeasonal.length) {
			console.error("Invalid index:", index);
			return;
		}

		const pricing = currentSeasonal[index];
		if (!pricing._id) {
			toast({
				title: "Error",
				description: "Cannot delete: pricing ID not found",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		// Store the pricing to delete and open confirmation dialog
		setSeasonalPricingToDelete({ ...pricing, index });
		onDeleteSeasonalDialogOpen();
	};

	const confirmDeleteSeasonal = async () => {
		if (!selectedApartment?._id || !seasonalPricingToDelete?._id) {
			return;
		}

		setDeletingSeasonalPricingId(seasonalPricingToDelete._id);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			await axios.delete(
				APARTMENT_ENDPOINTS.seasonalPricing.delete(selectedApartment._id, seasonalPricingToDelete._id),
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
				}
			);

			toast({
				title: "Success",
				description: "Seasonal pricing deleted.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});

			// Refetch apartment details to get updated pricing
			await fetchApartmentDetails(selectedApartment._id);
			onDeleteSeasonalDialogClose();
			setSeasonalPricingToDelete(null);
		} catch (error) {
			console.error("Error deleting seasonal pricing:", error);
			toast({
				title: "Error",
				description: error.response?.data?.error || error.response?.data?.message || error.message || "Failed to delete seasonal pricing",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setDeletingSeasonalPricingId(null);
		}
	};

	const closeSeasonalModal = () => {
		setSeasonalModalOpen(false);
		resetSeasonalForm();
	};

	const openBedroomModal = (pricing = null, index = null) => {
		if (!selectedApartment) return;
		setEditingBedroomIndex(typeof index === "number" ? index : null);
		setBedroomFormData({
			bedrooms: pricing?.bedrooms?.toString() || "",
			price: pricing?.price?.toString() || "",
			isActive: pricing?.isActive ?? true,
		});
		setBedroomModalOpen(true);
	};

	const handleBedroomSave = async () => {
		if (!selectedApartment?._id) return;
		const { bedrooms, price } = bedroomFormData;
		if (!bedrooms || !price) {
			toast({
				title: "Validation Error",
				description: "Bedrooms and price are required.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const parsedBedrooms = parseInt(bedrooms, 10);
		const parsedPrice = parseFloat(price);

		if (parsedBedrooms < 1) {
			toast({
				title: "Validation Error",
				description: "Bedrooms must be at least 1.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		// Validate bedroom count is less than total bedrooms
		if (selectedApartment.bedrooms && parsedBedrooms >= selectedApartment.bedrooms) {
			toast({
				title: "Validation Error",
				description: `Bedroom count must be less than the total bedrooms (${selectedApartment.bedrooms}).`,
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (parsedPrice < 0) {
			toast({
				title: "Validation Error",
				description: "Price cannot be negative.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		// Check for duplicate bedroom configurations (when adding new)
		if (editingBedroomIndex === null) {
			const currentBedroom = selectedApartment.bedroomPricing || [];
			const duplicate = currentBedroom.some(
				(pricing) => pricing.bedrooms === parsedBedrooms
			);
			if (duplicate) {
				toast({
					title: "Duplicate Configuration",
					description: "A configuration for that bedroom count already exists.",
					status: "warning",
					duration: 3000,
					isClosable: true,
				});
				return;
			}
		} else {
			// When editing, check for duplicates excluding the current one
			const currentBedroom = selectedApartment.bedroomPricing || [];
			const duplicate = currentBedroom.some(
				(pricing, idx) => pricing.bedrooms === parsedBedrooms && idx !== editingBedroomIndex
			);
			if (duplicate) {
				toast({
					title: "Duplicate Configuration",
					description: "A configuration for that bedroom count already exists.",
					status: "warning",
					duration: 3000,
					isClosable: true,
				});
				return;
			}
		}

		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			const apartmentId = selectedApartment._id;
			const currentBedroom = selectedApartment.bedroomPricing || [];
			const isEditing = editingBedroomIndex !== null && editingBedroomIndex >= 0 && editingBedroomIndex < currentBedroom.length;
			const pricingId = isEditing ? currentBedroom[editingBedroomIndex]._id : null;

			const payload = {
				bedrooms: parsedBedrooms,
				price: parsedPrice,
				isActive: bedroomFormData.isActive,
			};

			let response;
			if (isEditing && pricingId) {
				// Update existing
				response = await axios.put(
					APARTMENT_ENDPOINTS.bedroomPricing.update(apartmentId, pricingId),
					payload,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${authToken}`,
						},
					}
				);
			} else {
				// Create new
				response = await axios.post(
					APARTMENT_ENDPOINTS.bedroomPricing.create(apartmentId),
					payload,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${authToken}`,
						},
					}
				);
			}

			toast({
				title: "Success",
				description: isEditing ? "Bedroom pricing updated." : "Bedroom pricing created.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});

			// Refetch apartment details to get updated pricing
			await fetchApartmentDetails(apartmentId);
			
			setBedroomModalOpen(false);
			resetBedroomForm();
		} catch (error) {
			console.error("Error saving bedroom pricing:", error);
			toast({
				title: "Error",
				description: error.response?.data?.error || error.response?.data?.message || error.message || "Failed to save bedroom pricing",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
	};

	const handleDeleteBedroom = async (index) => {
		if (!selectedApartment?._id) return;
		const currentBedroom = selectedApartment.bedroomPricing || [];
		if (index < 0 || index >= currentBedroom.length) return;

		const pricing = currentBedroom[index];
		if (!pricing._id) {
			toast({
				title: "Error",
				description: "Cannot delete: pricing ID not found",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			await axios.delete(
				APARTMENT_ENDPOINTS.bedroomPricing.delete(selectedApartment._id, pricing._id),
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
				}
			);

			toast({
				title: "Success",
				description: "Bedroom pricing deleted.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});

			// Refetch apartment details to get updated pricing
			await fetchApartmentDetails(selectedApartment._id);
		} catch (error) {
			console.error("Error deleting bedroom pricing:", error);
			toast({
				title: "Error",
				description: error.response?.data?.error || error.response?.data?.message || error.message || "Failed to delete bedroom pricing",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
	};

	const closeBedroomModal = () => {
		setBedroomModalOpen(false);
		resetBedroomForm();
	};

	// Get available bedroom options based on apartment total bedrooms (matching agent app logic)
	const getAvailableBedroomOptions = () => {
		if (!selectedApartment || !selectedApartment.bedrooms) return [];
		
		const totalBedrooms = selectedApartment.bedrooms;
		const availableOptions = [];
		
		// Generate options from 1 to (totalBedrooms - 1)
		for (let i = 1; i < totalBedrooms; i++) {
			availableOptions.push(i);
		}
		
		const currentBedroomPricing = selectedApartment.bedroomPricing || [];
		
		// When adding (not editing), filter out already added bedroom pricing
		if (editingBedroomIndex === null) {
			const existingBedrooms = currentBedroomPricing.map(p => p.bedrooms);
			return availableOptions.filter(bedroom => !existingBedrooms.includes(bedroom));
		}
		
		// When editing, include all options (user can change to any available bedroom count)
		return availableOptions;
	};

	const handleModalClose = () => {
		setIsEditMode(false);
		setEditedApartment(null);
		setNewImages([]);
		setNewVideos([]);
		setDeletedImages([]);
		setDeletedVideos([]);
		setFavoriteImageIndex(null);
		closeSeasonalModal();
		closeBedroomModal();
		onClose();
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

	const handleMediaUpload = async (event) => {
		const files = Array.from(event.target.files);
		if (files.length === 0) return;

		setValidatingFiles(true);

		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) {
				toast({
					title: "Authentication Error",
					description: "Please log in to continue",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
				return;
			}

			const uploadService = createUploadService(authToken);
			await uploadService.getUploadLimits();

			const processedFiles = [];
			const errors = [];

			for (const file of files) {
				try {
					const fileType = uploadService.getFileTypeFromMimeType(file.type, file.name);
					const folder = fileType === 'image' ? 'pictures' : 'videos';

					const validation = uploadService.validateFile(file, folder);
					if (!validation.isValid) {
						errors.push(`${file.name}: ${validation.error}`);
						continue;
					}

					const mediaItem = {
						file: file,
						type: fileType,
						name: file.name,
						size: file.size,
						mimeType: file.type,
						preview: fileType === 'image' ? URL.createObjectURL(file) : null,
						uploadStatus: 'pending',
						uploadProgress: 0
					};

					if (fileType === 'image') {
						setNewImages(prev => [...prev, mediaItem]);
					} else {
						const videoUrl = URL.createObjectURL(file);
						mediaItem.preview = videoUrl;
						setNewVideos(prev => [...prev, mediaItem]);
					}

					processedFiles.push(mediaItem);

				} catch (error) {
					console.error('Error processing file:', error);
					errors.push(`${file.name}: Processing error`);
				}
			}

			if (errors.length > 0) {
				toast({
					title: "File Processing Errors",
					description: errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n... and ${errors.length - 3} more` : ''),
					status: "warning",
					duration: 6000,
					isClosable: true,
				});
			}

			if (processedFiles.length > 0) {
				toast({
					title: "Files Added",
					description: `${processedFiles.length} file(s) ready for upload${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
					status: "success",
					duration: 3000,
					isClosable: true,
				});
			}

		} catch (error) {
			console.error('Validation error:', error);
			toast({
				title: "Validation Error",
				description: error.message || 'Failed to validate files',
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setValidatingFiles(false);
		}
	};

	const handleDeleteExistingImage = (imageUrl) => {
		setDeletedImages(prev => [...prev, imageUrl]);
		setEditedApartment(prev => ({
			...prev,
			media: {
				...prev.media,
				images: prev.media?.images?.filter(img => img !== imageUrl) || []
			}
		}));
	};

	const handleDeleteExistingVideo = (videoUrl) => {
		setDeletedVideos(prev => [...prev, videoUrl]);
		setEditedApartment(prev => ({
			...prev,
			media: {
				...prev.media,
				videos: prev.media?.videos?.filter(vid => vid !== videoUrl) || []
			}
		}));
	};

	const handleDeleteNewImage = (index) => {
		setNewImages(prev => prev.filter((_, i) => i !== index));
	};

	const handleDeleteNewVideo = (index) => {
		setNewVideos(prev => prev.filter((_, i) => i !== index));
	};

	const toggleFavoriteImage = (index, isExisting = false) => {
		const targetArray = isExisting ? editedApartment?.media?.images : newImages;
		const targetItem = isExisting ? targetArray?.[index] : targetArray?.[index];

		if (!targetItem) return;

		if (!isExisting && targetItem.type !== 'image') {
			toast({
				title: "Invalid Selection",
				description: "Only images can be set as favorite images",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const globalIndex = isExisting ? index : (editedApartment?.media?.images?.length || 0) + index;
		const newFavoriteIndex = favoriteImageIndex === globalIndex ? null : globalIndex;
		setFavoriteImageIndex(newFavoriteIndex);

		if (!isExisting) {
			const updatedNewImages = newImages.map((item, i) => ({
				...item,
				isFavorite: i === index && newFavoriteIndex !== null
			}));
			setNewImages(updatedNewImages);
		}

		toast({
			title: newFavoriteIndex !== null ? "Favorite Image Set" : "Favorite Image Removed",
			description: newFavoriteIndex !== null
				? "This image will be displayed as the main apartment photo"
				: "No image selected as favorite",
			status: "success",
			duration: 3000,
			isClosable: true,
		});
	};

	const handleSaveEdit = async () => {
		if (!editedApartment) return;

		setUpdateLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			// Note: Files will be sent directly in FormData, backend will handle upload

			// Build update payload - backend expects all fields in the payload
			const updatePayload: any = {};

			// Add all changed fields
			if (editedApartment.apartmentName !== selectedApartment.apartmentName) {
				updatePayload.apartmentName = editedApartment.apartmentName;
			}
			if (editedApartment.description !== selectedApartment.description) {
				updatePayload.description = editedApartment.description;
			}
			if (editedApartment.bedrooms !== selectedApartment.bedrooms) {
				updatePayload.bedrooms = editedApartment.bedrooms;
			}
			if (editedApartment.bathrooms !== selectedApartment.bathrooms) {
				updatePayload.bathrooms = editedApartment.bathrooms;
			}
			if (editedApartment.beds !== selectedApartment.beds) {
				updatePayload.beds = editedApartment.beds;
			}
			if (editedApartment.guests !== selectedApartment.guests) {
				updatePayload.guests = editedApartment.guests;
			}
			if (editedApartment.address !== selectedApartment.address) {
				updatePayload.address = editedApartment.address;
			}
			if (editedApartment.city !== selectedApartment.city) {
				updatePayload.city = editedApartment.city;
			}
			if (editedApartment.state !== selectedApartment.state) {
				updatePayload.state = editedApartment.state;
			}
			if (editedApartment.defaultStayFee !== selectedApartment.defaultStayFee) {
				updatePayload.defaultStayFee = editedApartment.defaultStayFee;
			}
			if (editedApartment.cautionFee !== selectedApartment.cautionFee) {
				updatePayload.cautionFee = editedApartment.cautionFee;
			}
			if (JSON.stringify(editedApartment.optionalFees || {}) !== JSON.stringify(selectedApartment.optionalFees || {})) {
				updatePayload.optionalFees = editedApartment.optionalFees;
			}
			// Always include contact_details when editing - ensure all fields are included
			const editedContact = editedApartment.contact_details || {};
			const selectedContact = selectedApartment.contact_details || {};
			
			// Always include contact_details in the payload when editing (to ensure updates are saved)
			// Include all fields, using empty string as fallback for missing fields
			updatePayload.contact_details = {
				contactPersonName: editedContact.contactPersonName || "",
				contactPersonRole: editedContact.contactPersonRole || "",
				phone: editedContact.phone || selectedContact.phone || "", // Ensure phone is always set
			};
			console.log("✅ Contact details will be updated:", updatePayload.contact_details);
			if (JSON.stringify(editedApartment.accessDetails || {}) !== JSON.stringify(selectedApartment.accessDetails || {})) {
				updatePayload.accessDetails = editedApartment.accessDetails;
			}
			if (JSON.stringify(editedApartment.amenities || []) !== JSON.stringify(selectedApartment.amenities || [])) {
				updatePayload.amenities = editedApartment.amenities;
			}
			// Note: seasonalPricing and bedroomPricing are now managed via dedicated endpoints
			// They are not included in the general update payload

			// Handle deleted media - backend expects mediaToRemove array
			if (deletedImages.length > 0 || deletedVideos.length > 0) {
				updatePayload.mediaToRemove = [...deletedImages, ...deletedVideos];
			}

			// Note: Favorite image functionality will be handled separately if backend supports it
			// For now, we just handle uploads and deletions

			if (Object.keys(updatePayload).length === 0 && newImages.length === 0 && newVideos.length === 0 && deletedImages.length === 0 && deletedVideos.length === 0) {
				toast({
					title: "No Changes",
					description: "No changes were made to the apartment",
					status: "info",
					duration: 3000,
					isClosable: true,
				});
				setIsEditMode(false);
				return;
			}

			// Send as FormData since backend uses multipart/form-data middleware
			const formData = new FormData();

			// Add all fields to FormData
			Object.keys(updatePayload).forEach((key) => {
				const value = updatePayload[key];
				if (value !== undefined && value !== null) {
					if (typeof value === 'object' && !Array.isArray(value)) {
						// Stringify objects for FormData
						formData.append(key, JSON.stringify(value));
						console.log(`📤 Sending ${key}:`, JSON.stringify(value));
					} else if (Array.isArray(value)) {
						// Stringify arrays for FormData
						formData.append(key, JSON.stringify(value));
						console.log(`📤 Sending ${key}:`, JSON.stringify(value));
					} else {
						formData.append(key, value.toString());
						console.log(`📤 Sending ${key}:`, value.toString());
					}
				}
			});
			
			// Debug: Log what we're sending
			console.log("📋 Update Payload:", updatePayload);
			console.log("📋 Contact Details in Payload:", updatePayload.contact_details);
			console.log("📋 Seasonal Pricing in Payload:", updatePayload.seasonalPricing);
			console.log("📋 Bedroom Pricing in Payload:", updatePayload.bedroomPricing);

			// Add new files to FormData - backend expects files in 'media' field
			// Multer is configured to accept files in 'media' field and filter by mimetype
			if (newImages.length > 0 || newVideos.length > 0) {
				setUploadingMedia(true);
				const allFiles = [
					...newImages.map(img => img.file),
					...newVideos.map(vid => vid.file)
				].filter(Boolean); // Filter out any null/undefined files
				
				allFiles.forEach((file) => {
					formData.append('media', file);
				});
			}

			await axios.put(AdminUpdateApartmentAPI(selectedApartment._id), formData, {
				headers: {
					Authorization: `Bearer ${authToken}`,
					// Let axios set Content-Type automatically for FormData (includes boundary)
				},
			});

			setUploadingMedia(false);

			toast({
				title: "Apartment Updated",
				description: "Apartment details have been updated successfully",
				status: "success",
				duration: 4000,
				isClosable: true,
			});

			// Refetch apartment details to get updated data from backend
			await fetchApartmentDetails(selectedApartment._id);
			
			// Ensure we wait a bit for state to update
			await new Promise(resolve => setTimeout(resolve, 100));
			
			setIsEditMode(false);
			setEditedApartment(null);
			setNewImages([]);
			setNewVideos([]);
			setDeletedImages([]);
			setDeletedVideos([]);
			fetchApprovedApartments();

		} catch (error) {
			console.error("Error updating apartment:", error);
			setUploadingMedia(false);
			toast({
				title: "Update Failed",
				description: error.response?.data?.message || error.response?.data?.error || error.message || "Failed to update apartment",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setUpdateLoading(false);
			setUploadingMedia(false);
		}
	};

	// Template functions for DataTable
	const apartmentNameTemplate = (rowData) => {
		return (
			<HStack spacing={3}>
				<Avatar size="sm" name={rowData.apartmentName} bg="blue.500" />
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

	const statusTemplate = (rowData) => {
		return (
			<Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} py={1}>
				{rowData.status}
			</Badge>
		);
	};

	const priceTemplate = (rowData) => {
		return (
			<Text fontSize="sm" fontWeight="bold" color="green.600">
				₦{rowData.defaultStayFee?.toLocaleString() || 'N/A'}
			</Text>
		);
	};

	const handleRemoveApartment = (apartmentId, apartmentName) => {
		setApartmentToRemove({ id: apartmentId, name: apartmentName });
		setRemoveReason("");
		onRemoveDialogOpen();
	};

	const confirmRemoveApartment = async () => {
		if (!apartmentToRemove) return;

		setRemovingApartmentId(apartmentToRemove.id);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			await axios.patch(AdminRemoveApartmentAPI(apartmentToRemove.id), {
				reason: removeReason || "Removed from approved apartments by admin",
			}, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			toast({
				title: "Apartment Removed",
				description: `${apartmentToRemove.name} has been removed from approved apartments`,
				status: "success",
				duration: 4000,
				isClosable: true,
			});

			// Close modal if it's open
			if (selectedApartment?._id === apartmentToRemove.id) {
				handleModalClose();
			}

			// Refresh the list
			fetchApprovedApartments();
			onRemoveDialogClose();
			setApartmentToRemove(null);
			setRemoveReason("");
		} catch (error) {
			console.error("Error removing apartment:", error);
			toast({
				title: "Error",
				description: error.response?.data?.error || error.response?.data?.message || error.message || "Failed to remove apartment",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setRemovingApartmentId(null);
		}
	};

	const actionTemplate = (rowData) => {
		return (
			<HStack spacing={2}>
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
				<Button
					colorScheme="orange"
					size="sm"
					variant="outline"
					leftIcon={<Icon as={FaEdit} />}
					onClick={() => handleViewDetails(rowData.id, true)}
					borderRadius="full"
				>
					Edit
				</Button>
				<Button
					colorScheme="red"
					size="sm"
					variant="outline"
					leftIcon={<Icon as={FaTrash} />}
					isLoading={removingApartmentId === rowData.id}
					onClick={() => handleRemoveApartment(rowData.id, rowData.apartmentName)}
					borderRadius="full"
				>
					Remove
				</Button>
			</HStack>
		);
	};

	// Calculate statistics
	const totalApartments = approvedApartments.length;
	const totalRevenue = approvedApartments.reduce((sum, apt) => sum + (apt.defaultStayFee || 0), 0);
	const averagePrice = totalApartments > 0 ? totalRevenue / totalApartments : 0;
	const uniqueAgents = new Set(approvedApartments.map(apt => apt.agentEmail)).size;

	// Get current pricing data - ensure it's always an array
	const currentSeasonalPricing = (() => {
		const pricing = isEditMode ? editedApartment?.seasonalPricing : selectedApartment?.seasonalPricing;
		if (!pricing) return [];
		if (!Array.isArray(pricing)) return [pricing];
		return pricing;
	})();

	const currentBedroomPricing = (() => {
		const pricing = isEditMode ? editedApartment?.bedroomPricing : selectedApartment?.bedroomPricing;
		if (!pricing) return [];
		if (!Array.isArray(pricing)) return [pricing];
		return pricing;
	})();

	// Debug logging
	if (!isEditMode) {
		console.log("📊 View Mode - Pricing Data:", {
			selectedApartmentId: selectedApartment?._id,
			seasonalPricing: selectedApartment?.seasonalPricing,
			bedroomPricing: selectedApartment?.bedroomPricing,
			currentSeasonalPricing,
			currentBedroomPricing,
			seasonalLength: currentSeasonalPricing.length,
			bedroomLength: currentBedroomPricing.length
		});
	}

	useEffect(() => {
		fetchApprovedApartments();
	}, []);

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
								<StatLabel fontSize="md" opacity={0.8}>Total Approved</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{totalApartments}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Apartments</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Active Agents</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{uniqueAgents}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Unique agents</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Total Revenue</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">₦{totalRevenue.toLocaleString()}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Potential revenue</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Average Price</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">₦{averagePrice.toLocaleString()}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Per apartment</StatHelpText>
							</Stat>
						</Card>
					</SimpleGrid>

					{/* Main Table Card */}
					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<Flex justify="space-between" align="center" w="100%">
								<VStack align="start" spacing={1}>
									<Text fontSize="2xl" fontWeight="bold" color="gray.800">
										Approved Apartments
									</Text>
									<Text fontSize="md" color="gray.500">
										Manage and view all approved apartment listings
									</Text>
								</VStack>
							</Flex>
						</CardHeader>

						<CardBody display={"block"}>
							<Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
								<DataTable
									value={approvedApartments}
									paginator
									rows={10}
									rowsPerPageOptions={[5, 10, 25, 50]}
									emptyMessage="No approved apartments found."
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
										style={{ width: "15%", padding: "16px" }}
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
										style={{ width: "10%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>

									<Column
										field="approvedAt"
										header="Approved Date & Time"
										body={(row) => (
											<VStack align="start" spacing={0}>
												<Text fontSize="sm" color="gray.700" fontWeight="medium">
													{row.approvedAt ? new Date(row.approvedAt).toLocaleDateString('en-US', { 
														year: 'numeric', 
														month: 'short', 
														day: 'numeric' 
													}) : "N/A"}
												</Text>
												{row.approvedAt && (
													<Text fontSize="xs" color="gray.500">
														{new Date(row.approvedAt).toLocaleTimeString('en-US', { 
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

			{/* Apartment Details Modal */}
			<Modal isOpen={isOpen} onClose={handleModalClose} size="6xl">
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
										colorScheme="green"
										fontSize="sm"
									>
										{selectedApartment.status?.toUpperCase()}
									</Badge>
								)}
							</VStack>
							<HStack spacing={2}>
								{!isEditMode ? (
									<Button
										size="sm"
										colorScheme="orange"
										variant="outline"
										leftIcon={<Icon as={FaEdit} />}
										onClick={handleEditApartment}
									>
										Edit Details
									</Button>
								) : (
									<>
										<Button
											size="sm"
											colorScheme="green"
											isLoading={updateLoading || uploadingMedia}
											loadingText={uploadingMedia ? "Uploading..." : "Saving..."}
											onClick={handleSaveEdit}
										>
											Save
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={handleCancelEdit}
										>
											Cancel
										</Button>
									</>
								)}
							</HStack>
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
											{/* Upload Section - Only show in edit mode */}
											{isEditMode && (
												<Box p={4} bg="blue.50" borderRadius="md" border="2px dashed" borderColor="blue.300">
													<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
														Upload New Media
													</Text>

													{/* Favorite Image Info */}
													<Box
														bg="yellow.50"
														border="1px solid"
														borderColor="yellow.300"
														borderRadius="md"
														p={3}
														mb={4}
													>
														<Flex align="center" gap={2} mb={2}>
															<FaStar color="#FFD700" size={16} />
															<Text fontSize="sm" fontWeight="bold" color="yellow.800">
																Featured Image Selection
															</Text>
														</Flex>
														<Text fontSize="sm" color="yellow.700">
															Click the star icon on any image to set it as the featured image that will be displayed as the main apartment photo.
														</Text>
													</Box>
													<Flex gap={4} wrap="wrap">
														<Box>
															<Text fontSize="sm" fontWeight="bold" mb={2}>Upload Images</Text>
															<Input
																type="file"
																accept="image/*"
																multiple
																onChange={handleMediaUpload}
																display="none"
																id="image-upload"
															/>
															<Button
																as="label"
																htmlFor="image-upload"
																leftIcon={<Icon as={FaUpload} />}
																colorScheme="blue"
																variant="outline"
																cursor="pointer"
																isLoading={validatingFiles}
																loadingText="Processing..."
															>
																{validatingFiles ? "Processing..." : "Select Images"}
															</Button>
														</Box>
														<Box>
															<Text fontSize="sm" fontWeight="bold" mb={2}>Upload Videos</Text>
															<Input
																type="file"
																accept="video/*"
																multiple
																onChange={handleMediaUpload}
																display="none"
																id="video-upload"
															/>
															<Button
																as="label"
																htmlFor="video-upload"
																leftIcon={<Icon as={FaUpload} />}
																colorScheme="purple"
																variant="outline"
																cursor="pointer"
																isLoading={validatingFiles}
																loadingText="Processing..."
															>
																{validatingFiles ? "Processing..." : "Select Videos"}
															</Button>
														</Box>
													</Flex>
												</Box>
											)}

											{/* New Images Preview */}
											{newImages.length > 0 && (
												<Box>
													<Text fontSize="lg" fontWeight="bold" mb={4} color="blue.600">
														New Images ({newImages.length}) - To be uploaded
													</Text>
													<SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
														{newImages.map((imageObj, index) => (
															<AspectRatio key={index} ratio={1}>
																<Box position="relative">
																	<Image
																		src={imageObj.preview}
																		alt={`New image ${index + 1}`}
																		borderRadius="md"
																		objectFit="cover"
																		border="3px solid"
																		borderColor="blue.400"
																	/>

																	{/* Favorite Selection Badge - Only for images */}
																	{imageObj.type === 'image' && (
																		<IconButton
																			icon={<Icon as={favoriteImageIndex === ((editedApartment?.media?.images?.length || 0) + index) ? FaStar : FaRegStar} />}
																			size="sm"
																			colorScheme={favoriteImageIndex === ((editedApartment?.media?.images?.length || 0) + index) ? "yellow" : "blackAlpha"}
																			variant="solid"
																			position="absolute"
																			top={1}
																			left={1}
																			bg={favoriteImageIndex === ((editedApartment?.media?.images?.length || 0) + index) ? "#FFD700" : "rgba(0,0,0,0.7)"}
																			color={favoriteImageIndex === ((editedApartment?.media?.images?.length || 0) + index) ? "#000" : "white"}
																			_hover={{
																				bg: favoriteImageIndex === ((editedApartment?.media?.images?.length || 0) + index) ? "#FFD700" : "rgba(0,0,0,0.9)"
																			}}
																			onClick={() => toggleFavoriteImage(index, false)}
																			aria-label="Toggle favorite image"
																		/>
																	)}

																	{/* Favorite Label */}
																	{imageObj.type === 'image' && favoriteImageIndex === ((editedApartment?.media?.images?.length || 0) + index) && (
																		<Box
																			position="absolute"
																			bottom="8px"
																			left={0}
																			right={0}
																			bg="rgba(255,215,0,0.95)"
																			py={1}
																			px={2}
																		>
																			<Text
																				color="#000"
																				fontSize="xs"
																				fontWeight="bold"
																				textAlign="center"
																			>
																				FEATURED
																			</Text>
																		</Box>
																	)}

																	<IconButton
																		icon={<Icon as={FaTimes} />}
																		size="sm"
																		colorScheme="red"
																		variant="solid"
																		position="absolute"
																		top={1}
																		right={1}
																		onClick={() => handleDeleteNewImage(index)}
																		aria-label="Delete new image"
																	/>
																</Box>
															</AspectRatio>
														))}
													</SimpleGrid>
												</Box>
											)}

											{/* Existing Images Gallery */}
											{(selectedApartment.media?.images?.length > 0 || editedApartment?.media?.images?.length > 0) && (
												<Box>
													<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
														Images ({isEditMode ? editedApartment?.media?.images?.length || 0 : selectedApartment.media.images.length})
													</Text>
													<SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
														{(isEditMode ? editedApartment?.media?.images : selectedApartment.media.images)?.map((image, index) => (
															<AspectRatio key={index} ratio={1}>
																<Box position="relative">
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
																		onClick={() => !isEditMode && openMediaViewer(image, 'image', index)}
																	/>

																	{/* Favorite Selection Badge - Only for existing images in edit mode */}
																	{isEditMode && (
																		<IconButton
																			icon={<Icon as={favoriteImageIndex === index ? FaStar : FaRegStar} />}
																			size="sm"
																			colorScheme={favoriteImageIndex === index ? "yellow" : "blackAlpha"}
																			variant="solid"
																			position="absolute"
																			top={1}
																			left={1}
																			bg={favoriteImageIndex === index ? "#FFD700" : "rgba(0,0,0,0.7)"}
																			color={favoriteImageIndex === index ? "#000" : "white"}
																			_hover={{
																				bg: favoriteImageIndex === index ? "#FFD700" : "rgba(0,0,0,0.9)"
																			}}
																			onClick={() => toggleFavoriteImage(index, true)}
																			aria-label="Toggle favorite image"
																		/>
																	)}

																	{/* Favorite Label for existing images */}
																	{isEditMode && favoriteImageIndex === index && (
																		<Box
																			position="absolute"
																			bottom="8px"
																			left={0}
																			right={0}
																			bg="rgba(255,215,0,0.95)"
																			py={1}
																			px={2}
																		>
																			<Text
																				color="#000"
																				fontSize="xs"
																				fontWeight="bold"
																				textAlign="center"
																			>
																				FEATURED
																			</Text>
																		</Box>
																	)}

																	{isEditMode && (
																		<IconButton
																			icon={<Icon as={FaTrash} />}
																			size="sm"
																			colorScheme="red"
																			variant="solid"
																			position="absolute"
																			top={1}
																			right={1}
																			onClick={() => handleDeleteExistingImage(image)}
																			aria-label="Delete image"
																		/>
																	)}
																</Box>
															</AspectRatio>
														))}
													</SimpleGrid>
												</Box>
											)}

											{/* New Videos Preview */}
											{newVideos.length > 0 && (
												<Box>
													<Text fontSize="lg" fontWeight="bold" mb={4} color="purple.600">
														New Videos ({newVideos.length}) - To be uploaded
													</Text>
													<SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
														{newVideos.map((videoObj, index) => (
															<AspectRatio key={index} ratio={16 / 9}>
																<Box position="relative">
																	<video
																		src={videoObj.preview}
																		style={{
																			width: "100%",
																			height: "100%",
																			objectFit: "cover",
																			borderRadius: "8px",
																			border: "3px solid #805AD5"
																		}}
																		controls
																	/>

																	<IconButton
																		icon={<Icon as={FaTimes} />}
																		size="sm"
																		colorScheme="red"
																		variant="solid"
																		position="absolute"
																		top={1}
																		right={1}
																		onClick={() => handleDeleteNewVideo(index)}
																		aria-label="Delete new video"
																	/>
																</Box>
															</AspectRatio>
														))}
													</SimpleGrid>
												</Box>
											)}

											{/* Existing Videos Gallery */}
											{(selectedApartment.media?.videos?.length > 0 || editedApartment?.media?.videos?.length > 0) && (
												<Box>
													<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
														Videos ({isEditMode ? editedApartment?.media?.videos?.length || 0 : selectedApartment.media.videos.length})
													</Text>
													<SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
														{(isEditMode ? editedApartment?.media?.videos : selectedApartment.media.videos)?.map((video, videoIndex) => {
															const mediaIndex = (selectedApartment.media?.images?.length || 0) + videoIndex;
															return (
																<AspectRatio key={videoIndex} ratio={16 / 9} position="relative">
																	<Box position="relative">
																	<Box
																		borderRadius="md"
																		overflow="hidden"
																		cursor="pointer"
																		transition="all 0.2s"
																		_hover={{
																			transform: "scale(1.02)",
																			boxShadow: "lg"
																		}}
																			onClick={() => !isEditMode && openMediaViewer(video, 'video', mediaIndex)}
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
																			{!isEditMode && (
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
																			)}
																		</Box>
																		{isEditMode && (
																			<IconButton
																				icon={<Icon as={FaTrash} />}
																				size="sm"
																				colorScheme="red"
																				variant="solid"
																				position="absolute"
																				top={1}
																				right={1}
																				onClick={() => handleDeleteExistingVideo(video)}
																				aria-label="Delete video"
																			/>
																		)}
																	</Box>
																</AspectRatio>
															);
														})}
													</SimpleGrid>
												</Box>
											)}

											{(!selectedApartment.media?.images?.length && !selectedApartment.media?.videos?.length && !isEditMode && newImages.length === 0 && newVideos.length === 0) && (
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
														{isEditMode && editedApartment ? (
															<Stack spacing={4}>
																<FormControl>
																	<FormLabel>Apartment Name</FormLabel>
																	<Input
																		value={editedApartment.apartmentName || ""}
																		onChange={(e) => setEditedApartment({ ...editedApartment, apartmentName: e.target.value })}
																	/>
																</FormControl>
																<FormControl>
																	<FormLabel>Description</FormLabel>
																	<Textarea
																		value={editedApartment.description || ""}
																		onChange={(e) => setEditedApartment({ ...editedApartment, description: e.target.value })}
																		rows={4}
																	/>
																</FormControl>
																<FormControl>
																	<FormLabel>Address</FormLabel>
																	<Input
																		value={editedApartment.address || ""}
																		onChange={(e) => setEditedApartment({ ...editedApartment, address: e.target.value })}
																	/>
																</FormControl>
																<Grid templateColumns="1fr 1fr" gap={4}>
																	<FormControl>
																		<FormLabel>City</FormLabel>
																		<Input
																			value={editedApartment.city || ""}
																			onChange={(e) => setEditedApartment({ ...editedApartment, city: e.target.value })}
																		/>
																	</FormControl>
																	<FormControl>
																		<FormLabel>State</FormLabel>
																		<Input
																			value={editedApartment.state || ""}
																			onChange={(e) => setEditedApartment({ ...editedApartment, state: e.target.value })}
																		/>
																	</FormControl>
																</Grid>
																<Grid templateColumns="repeat(2, 1fr)" gap={4}>
																	<FormControl>
																		<FormLabel>Bedrooms</FormLabel>
																		<NumberInput
																			value={editedApartment.bedrooms || 0}
																			onChange={(value) => setEditedApartment({ ...editedApartment, bedrooms: parseInt(value) || 0 })}
																			min={0}
																		>
																			<NumberInputField />
																			<NumberInputStepper>
																				<NumberIncrementStepper />
																				<NumberDecrementStepper />
																			</NumberInputStepper>
																		</NumberInput>
																	</FormControl>
																	<FormControl>
																		<FormLabel>Bathrooms</FormLabel>
																		<NumberInput
																			value={editedApartment.bathrooms || 0}
																			onChange={(value) => setEditedApartment({ ...editedApartment, bathrooms: parseInt(value) || 0 })}
																			min={0}
																		>
																			<NumberInputField />
																			<NumberInputStepper>
																				<NumberIncrementStepper />
																				<NumberDecrementStepper />
																			</NumberInputStepper>
																		</NumberInput>
																	</FormControl>
																	<FormControl>
																		<FormLabel>Beds</FormLabel>
																		<NumberInput
																			value={editedApartment.beds || 0}
																			onChange={(value) => setEditedApartment({ ...editedApartment, beds: parseInt(value) || 0 })}
																			min={0}
																		>
																			<NumberInputField />
																			<NumberInputStepper>
																				<NumberIncrementStepper />
																				<NumberDecrementStepper />
																			</NumberInputStepper>
																		</NumberInput>
																	</FormControl>
																	<FormControl>
																		<FormLabel>Guests</FormLabel>
																		<NumberInput
																			value={editedApartment.guests || 0}
																			onChange={(value) => setEditedApartment({ ...editedApartment, guests: parseInt(value) || 0 })}
																			min={0}
																		>
																			<NumberInputField />
																			<NumberInputStepper>
																				<NumberIncrementStepper />
																				<NumberDecrementStepper />
																			</NumberInputStepper>
																		</NumberInput>
																	</FormControl>
																</Grid>
															</Stack>
														) : (
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
														)}
													</Box>

													<Box p={4} bg="gray.50" borderRadius="md">
														<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
															Description
														</Text>
														{isEditMode && editedApartment ? (
															<Textarea
																value={editedApartment.description || ""}
																onChange={(e) => setEditedApartment({ ...editedApartment, description: e.target.value })}
																rows={4}
															/>
														) : (
														<Text>{selectedApartment.description || "No description available"}</Text>
														)}
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
										<Stack spacing={6} mt={6}>
											<Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
												<Flex justify="space-between" align="center" mb={3}>
													<Text fontSize="lg" fontWeight="bold" color="#de9301">
														Seasonal Pricing
													</Text>
													{isEditMode && (
														<Button
															size="sm"
															leftIcon={<Icon as={FaPlus} />}
															colorScheme="orange"
															variant="outline"
															onClick={() => openSeasonalModal()}
														>
															Add Season
														</Button>
													)}
												</Flex>
												{currentSeasonalPricing.length > 0 ? (
													<Stack spacing={3}>
														{currentSeasonalPricing.map((pricing, index) => (
															<Flex
																key={pricing._id || index}
																justify="space-between"
																align="center"
																p={3}
																borderRadius="md"
																border="1px solid"
																borderColor="gray.100"
																bg="gray.50"
															>
																<VStack align="start" spacing={0}>
																	<Text fontWeight="600">{pricing.name}</Text>
																	<Text color="gray.600">
																		+₦{(pricing.additionalFee || 0).toLocaleString()} per night
																	</Text>
																	<Text fontSize="sm" color="gray.500">
																		{formatDateLabel(pricing.startDate)} —{" "}
																		{formatDateLabel(pricing.endDate)}
																	</Text>
																</VStack>
																<HStack spacing={2}>
																	<Badge colorScheme={pricing.isActive ? "green" : "red"}>
																		{pricing.isActive ? "Active" : "Inactive"}
																	</Badge>
																	{isEditMode && (
																		<>
																			<IconButton
																				size="sm"
																				variant="ghost"
																				colorScheme="orange"
																				aria-label="Edit season"
																				icon={<Icon as={FaEdit} />}
																				onClick={() => openSeasonalModal(pricing, index)}
																			/>
																			<IconButton
																				size="sm"
																				variant="ghost"
																				colorScheme="red"
																				aria-label="Delete season"
																				icon={<Icon as={FaTrash} />}
																				onClick={(e) => {
																					e.preventDefault();
																					e.stopPropagation();
																					handleDeleteSeasonal(index, e);
																				}}
																			/>
																		</>
																	)}
																</HStack>
															</Flex>
														))}
													</Stack>
												) : (
													<Text color="gray.500">No seasonal pricing configured yet.</Text>
												)}
											</Box>

											<Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
												<Flex justify="space-between" align="center" mb={3}>
													<Text fontSize="lg" fontWeight="bold" color="#de9301">
														Bedroom Pricing
													</Text>
													{isEditMode && (
														<Button
															size="sm"
															leftIcon={<Icon as={FaPlus} />}
															colorScheme="orange"
															variant="outline"
															onClick={() => openBedroomModal()}
														>
															Add Configuration
														</Button>
													)}
												</Flex>
												{currentBedroomPricing.length > 0 ? (
													<Stack spacing={3}>
														{currentBedroomPricing
															.sort((a, b) => a.bedrooms - b.bedrooms)
															.map((pricing, index) => (
																<Flex
																	key={pricing._id || index}
																	justify="space-between"
																	align="center"
																	p={3}
																	borderRadius="md"
																	border="1px solid"
																	borderColor="gray.100"
																	bg="gray.50"
																>
																	<VStack align="start" spacing={0}>
																		<Text fontWeight="600">
																			{pricing.bedrooms}{" "}
																			{pricing.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
																		</Text>
																		<Text color="gray.600">
																			₦{(pricing.price || 0).toLocaleString()} per night
																		</Text>
																	</VStack>
																	<HStack spacing={2}>
																		<Badge colorScheme={pricing.isActive ? "green" : "red"}>
																			{pricing.isActive ? "Active" : "Inactive"}
																		</Badge>
																		{isEditMode && (
																			<>
																				<IconButton
																					size="sm"
																					variant="ghost"
																					colorScheme="orange"
																					aria-label="Edit bedroom pricing"
																					icon={<Icon as={FaEdit} />}
																					onClick={() => openBedroomModal(pricing, index)}
																				/>
																				<IconButton
																					size="sm"
																					variant="ghost"
																					colorScheme="red"
																					aria-label="Delete bedroom pricing"
																					icon={<Icon as={FaTrash} />}
																					onClick={() => handleDeleteBedroom(index)}
																				/>
																			</>
																		)}
																	</HStack>
																</Flex>
															))}
													</Stack>
												) : (
													<Text color="gray.500">No bedroom pricing configured yet.</Text>
												)}
											</Box>
										</Stack>
									</TabPanel>

									{/* Amenities Tab */}
									<TabPanel>
										<Box>
											<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
												Available Amenities
											</Text>
											{isEditMode && editedApartment ? (
												<VStack align="stretch" spacing={4}>
													<Text fontSize="md" color="gray.600">
														Select the amenities available at this apartment:
													</Text>
													<CheckboxGroup
														value={editedApartment?.amenities || []}
														onChange={(value) => setEditedApartment(prev => ({ ...prev, amenities: value }))}
													>
														<SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
															{[
																"WiFi", "Air Conditioning", "Swimming Pool", "Gym", "Parking",
																"Balcony", "Kitchen", "Laundry", "Security", "Elevator",
																"Garden", "Playground", "Conference Room", "Restaurant",
																"Spa", "Business Center", "Concierge", "Pet Friendly",
																"Wheelchair Accessible", "Beach Access", "Terrace", "Fireplace",
																"Dishwasher", "Microwave", "Coffee Machine", "TV", "Sound System"
															].map(amenity => (
																<Checkbox key={amenity} value={amenity}>
																	{amenity}
																</Checkbox>
															))}
														</SimpleGrid>
													</CheckboxGroup>

													<Box mt={4}>
														<Text fontSize="sm" fontWeight="bold" mb={2}>Add Custom Amenity:</Text>
														<Flex gap={2}>
															<Input
																placeholder="Type amenity and press Enter"
																onKeyPress={(e) => {
																	if (e.key === 'Enter' && e.target.value.trim()) {
																		const customAmenity = e.target.value.trim();
																		if (!editedApartment?.amenities?.includes(customAmenity)) {
																			setEditedApartment(prev => ({
																				...prev,
																				amenities: [...(prev.amenities || []), customAmenity]
																			}));
																		}
																		e.target.value = '';
																	}
																}}
															/>
														</Flex>
														{editedApartment?.amenities?.filter(amt => ![
															"WiFi", "Air Conditioning", "Swimming Pool", "Gym", "Parking",
															"Balcony", "Kitchen", "Laundry", "Security", "Elevator",
															"Garden", "Playground", "Conference Room", "Restaurant",
															"Spa", "Business Center", "Concierge", "Pet Friendly",
															"Wheelchair Accessible", "Beach Access", "Terrace", "Fireplace",
															"Dishwasher", "Microwave", "Coffee Machine", "TV", "Sound System"
														].includes(amt)).length > 0 && (
															<Wrap spacing={2} mt={3}>
																<Text fontSize="sm" fontWeight="bold" width="100%">Custom Amenities:</Text>
																{editedApartment.amenities.filter(amt => ![
																	"WiFi", "Air Conditioning", "Swimming Pool", "Gym", "Parking",
																	"Balcony", "Kitchen", "Laundry", "Security", "Elevator",
																	"Garden", "Playground", "Conference Room", "Restaurant",
																	"Spa", "Business Center", "Concierge", "Pet Friendly",
																	"Wheelchair Accessible", "Beach Access", "Terrace", "Fireplace",
																	"Dishwasher", "Microwave", "Coffee Machine", "TV", "Sound System"
																].includes(amt)).map((amenity, idx) => (
																	<WrapItem key={idx}>
																		<Tag
																			size="md"
																			colorScheme="purple"
																			borderRadius="full"
																			px={3}
																			py={1}
																		>
																			{amenity}
																			<IconButton
																				icon={<Icon as={FaTimes} />}
																				size="xs"
																				variant="ghost"
																				colorScheme="red"
																				ml={2}
																				onClick={() => {
																					setEditedApartment(prev => ({
																						...prev,
																						amenities: prev.amenities?.filter(a => a !== amenity) || []
																					}));
																				}}
																				aria-label="Remove amenity"
																			/>
																		</Tag>
																	</WrapItem>
																))}
															</Wrap>
														)}
													</Box>
												</VStack>
											) : (
											<Wrap spacing={3}>
												{selectedApartment.amenities && Array.isArray(selectedApartment.amenities) && selectedApartment.amenities.length > 0 ? (
													selectedApartment.amenities.map((amenity, index) => (
														<WrapItem key={index}>
															<Tag size="lg" colorScheme="blue" borderRadius="full" px={4} py={2}>
																{amenity}
															</Tag>
														</WrapItem>
													))
												) : (
													<Box p={4} textAlign="center" color="gray.500">
														<Text>No amenities available for this apartment</Text>
													</Box>
												)}
											</Wrap>
											)}
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
													{isEditMode && editedApartment ? (
														<Stack spacing={4}>
															<FormControl>
																<FormLabel>Default Stay Fee (₦)</FormLabel>
																<NumberInput
																	value={editedApartment.defaultStayFee || 0}
																	onChange={(value) => setEditedApartment({ ...editedApartment, defaultStayFee: parseFloat(value) || 0 })}
																	min={0}
																>
																	<NumberInputField />
																	<NumberInputStepper>
																		<NumberIncrementStepper />
																		<NumberDecrementStepper />
																	</NumberInputStepper>
																</NumberInput>
															</FormControl>
															<FormControl>
																<FormLabel>Caution Fee (₦)</FormLabel>
																<NumberInput
																	value={editedApartment.cautionFee || 0}
																	onChange={(value) => setEditedApartment({ ...editedApartment, cautionFee: parseFloat(value) || 0 })}
																	min={0}
																>
																	<NumberInputField />
																	<NumberInputStepper>
																		<NumberIncrementStepper />
																		<NumberDecrementStepper />
																	</NumberInputStepper>
																</NumberInput>
															</FormControl>
														</Stack>
													) : (
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
													)}
												</Box>
											</GridItem>

											<GridItem>
												<Box p={4} bg="blue.50" borderRadius="md">
													<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
														Optional Fees
													</Text>
													{isEditMode && editedApartment ? (
														<Stack spacing={4}>
															<FormControl>
																<FormLabel>Party Fee (₦)</FormLabel>
																<NumberInput
																	value={editedApartment.optionalFees?.partyFee || 0}
																	onChange={(value) => setEditedApartment({
																		...editedApartment,
																		optionalFees: {
																			...editedApartment.optionalFees,
																			partyFee: parseFloat(value) || 0
																		}
																	})}
																	min={0}
																>
																	<NumberInputField />
																	<NumberInputStepper>
																		<NumberIncrementStepper />
																		<NumberDecrementStepper />
																	</NumberInputStepper>
																</NumberInput>
															</FormControl>
															<FormControl>
																<FormLabel>Movie Shoot Fee (₦)</FormLabel>
																<NumberInput
																	value={editedApartment.optionalFees?.movieShootFee || 0}
																	onChange={(value) => setEditedApartment({
																		...editedApartment,
																		optionalFees: {
																			...editedApartment.optionalFees,
																			movieShootFee: parseFloat(value) || 0
																		}
																	})}
																	min={0}
																>
																	<NumberInputField />
																	<NumberInputStepper>
																		<NumberIncrementStepper />
																		<NumberDecrementStepper />
																	</NumberInputStepper>
																</NumberInput>
															</FormControl>
															<FormControl>
																<FormLabel>Photo Shoot Fee (₦)</FormLabel>
																<NumberInput
																	value={editedApartment.optionalFees?.photoShootFee || 0}
																	onChange={(value) => setEditedApartment({
																		...editedApartment,
																		optionalFees: {
																			...editedApartment.optionalFees,
																			photoShootFee: parseFloat(value) || 0
																		}
																	})}
																	min={0}
																>
																	<NumberInputField />
																	<NumberInputStepper>
																		<NumberIncrementStepper />
																		<NumberDecrementStepper />
																	</NumberInputStepper>
																</NumberInput>
															</FormControl>
														</Stack>
													) : (
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
													)}
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
											{isEditMode && editedApartment ? (
												<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
													<GridItem>
														<Stack spacing={4}>
															<FormControl>
																<FormLabel>Contact Person Name</FormLabel>
																<Input
																	value={editedApartment.contact_details?.contactPersonName || ""}
																	onChange={(e) => setEditedApartment({
																		...editedApartment,
																		contact_details: {
																			...(editedApartment.contact_details || {}),
																			contactPersonName: e.target.value
																		}
																	})}
																	placeholder="Enter contact person name"
																/>
															</FormControl>
															<FormControl>
																<FormLabel>Contact Person Role</FormLabel>
																<Input
																	value={editedApartment.contact_details?.contactPersonRole || ""}
																	onChange={(e) => setEditedApartment({
																		...editedApartment,
																		contact_details: {
																			...(editedApartment.contact_details || {}),
																			contactPersonRole: e.target.value
																		}
																	})}
																	placeholder="Enter contact person role"
																/>
															</FormControl>
															<FormControl>
																<FormLabel>Phone Number</FormLabel>
																<Input
																	value={editedApartment.contact_details?.phone || ""}
																	onChange={(e) => setEditedApartment({
																		...editedApartment,
																		contact_details: {
																			...(editedApartment.contact_details || {}),
																			phone: e.target.value
																		}
																	})}
																	placeholder="Enter phone number"
																/>
															</FormControl>
														</Stack>
													</GridItem>
												</Grid>
											) : (
											<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
												<GridItem>
													<Stack spacing={3}>
														<Text><strong>Contact Person:</strong> {selectedApartment.contact_details?.contactPersonName}</Text>
														<Text><strong>Role:</strong> {selectedApartment.contact_details?.contactPersonRole}</Text>
														<Flex align="center">
															<Icon as={FaPhoneAlt} color="green.500" mr={2} />
															<Text><strong>Phone:</strong> {selectedApartment.contact_details?.phone}</Text>
														</Flex>
													</Stack>
												</GridItem>
											</Grid>
											)}
										</Box>
									</TabPanel>

									{/* Access Tab */}
									<TabPanel>
										<Box p={4} bg="yellow.50" borderRadius="md">
											<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
												Access Details
											</Text>
											{isEditMode && editedApartment ? (
												<Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
													<GridItem>
														<FormControl>
															<FormLabel>
																<Flex align="center">
																	<Icon as={FaWifi} color="blue.500" mr={2} />
																	<Text fontWeight="bold">WiFi Code</Text>
																</Flex>
															</FormLabel>
															<Input
																fontFamily="mono"
																fontSize="lg"
																value={editedApartment.accessDetails?.wifiCode || ""}
																onChange={(e) => setEditedApartment({
																	...editedApartment,
																	accessDetails: {
																		...editedApartment.accessDetails,
																		wifiCode: e.target.value
																	}
																})}
																placeholder="WiFi password"
															/>
														</FormControl>
													</GridItem>
													<GridItem>
														<FormControl>
															<FormLabel>
																<Text fontWeight="bold">Door Code</Text>
															</FormLabel>
															<Input
																fontFamily="mono"
																fontSize="lg"
																value={editedApartment.accessDetails?.doorCode || ""}
																onChange={(e) => setEditedApartment({
																	...editedApartment,
																	accessDetails: {
																		...editedApartment.accessDetails,
																		doorCode: e.target.value
																	}
																})}
																placeholder="Door access code"
															/>
														</FormControl>
													</GridItem>
													<GridItem>
														<FormControl>
															<FormLabel>
																<Text fontWeight="bold">Access Code</Text>
															</FormLabel>
															<Input
																fontFamily="mono"
																fontSize="lg"
																value={editedApartment.accessDetails?.accessCode || ""}
																onChange={(e) => setEditedApartment({
																	...editedApartment,
																	accessDetails: {
																		...editedApartment.accessDetails,
																		accessCode: e.target.value
																	}
																})}
																placeholder="General access code"
															/>
														</FormControl>
													</GridItem>
												</Grid>
											) : (
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
											)}
										</Box>
									</TabPanel>
								</TabPanels>
							</ModalTabs>
						) : (
							<Text>No details available</Text>
						)}
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" onClick={handleModalClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Seasonal Pricing Modal */}
			<Modal isOpen={isSeasonalModalOpen} onClose={closeSeasonalModal} size="lg">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						{editingSeasonalIndex !== null ? "Edit Seasonal Pricing" : "Add Seasonal Pricing"}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
							<FormControl>
								<FormLabel>Name</FormLabel>
								<Input
									value={seasonalFormData.name}
									onChange={(e) =>
										setSeasonalFormData((prev) => ({ ...prev, name: e.target.value }))
									}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Additional Fee (₦)</FormLabel>
								<NumberInput
									value={seasonalFormData.additionalFee}
									min={0}
									onChange={(value) =>
										setSeasonalFormData((prev) => ({ ...prev, additionalFee: value }))
									}
								>
									<NumberInputField />
								</NumberInput>
							</FormControl>
							<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
								<FormControl>
									<FormLabel>Start Date</FormLabel>
									<Input
										type="date"
										value={seasonalFormData.startDate}
										onChange={(e) =>
											setSeasonalFormData((prev) => ({
												...prev,
												startDate: e.target.value,
											}))
										}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>End Date</FormLabel>
									<Input
										type="date"
										value={seasonalFormData.endDate}
										onChange={(e) =>
											setSeasonalFormData((prev) => ({
												...prev,
												endDate: e.target.value,
											}))
										}
									/>
								</FormControl>
							</SimpleGrid>
							<FormControl display="flex" alignItems="center">
								<Checkbox
									isChecked={seasonalFormData.isActive}
									onChange={(e) =>
										setSeasonalFormData((prev) => ({ ...prev, isActive: e.target.checked }))
									}
								>
									Active
								</Checkbox>
							</FormControl>
						</Stack>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={closeSeasonalModal}>
							Cancel
						</Button>
						<Button colorScheme="orange" onClick={handleSeasonalSave}>
							Save
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Bedroom Pricing Modal */}
			<Modal isOpen={isBedroomModalOpen} onClose={closeBedroomModal} size="lg">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						{editingBedroomIndex !== null ? "Edit Bedroom Pricing" : "Add Bedroom Pricing"}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack spacing={4}>
							<FormControl>
								<FormLabel>Bedrooms</FormLabel>
								{(() => {
									const availableOptions = getAvailableBedroomOptions();
									const totalBedrooms = selectedApartment?.bedrooms || 0;
									
									if (totalBedrooms <= 1) {
										return (
											<Box p={3} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
												<Text fontSize="sm" color="yellow.800">
													For a {totalBedrooms} bedroom apartment, you cannot add pricing for partial bedrooms. Only the full apartment pricing is available.
												</Text>
											</Box>
										);
									}
									
									if (availableOptions.length === 0 && editingBedroomIndex === null) {
										return (
											<Box p={3} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
												<Text fontSize="sm" color="yellow.800">
													All available bedroom configurations have been added.
												</Text>
											</Box>
										);
									}
									
									return (
										<Select
											value={bedroomFormData.bedrooms}
											onChange={(e) =>
												setBedroomFormData((prev) => ({ ...prev, bedrooms: e.target.value }))
											}
											placeholder="Select number of bedrooms"
											isDisabled={availableOptions.length === 0 && editingBedroomIndex === null}
										>
											{availableOptions.map((option) => (
												<option key={option} value={option}>
													{option} {option === 1 ? "Bedroom" : "Bedrooms"}
												</option>
											))}
										</Select>
									);
								})()}
							</FormControl>
							<FormControl>
								<FormLabel>Price (₦)</FormLabel>
								<NumberInput
									value={bedroomFormData.price}
									min={0}
									onChange={(value) =>
										setBedroomFormData((prev) => ({ ...prev, price: value }))
									}
								>
									<NumberInputField />
								</NumberInput>
							</FormControl>
							<FormControl display="flex" alignItems="center">
								<Checkbox
									isChecked={bedroomFormData.isActive}
									onChange={(e) =>
										setBedroomFormData((prev) => ({ ...prev, isActive: e.target.checked }))
									}
								>
									Active
								</Checkbox>
							</FormControl>
						</Stack>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={closeBedroomModal}>
							Cancel
						</Button>
						<Button colorScheme="orange" onClick={handleBedroomSave}>
							Save
						</Button>
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

			{/* Remove Apartment Confirmation Dialog */}
			<AlertDialog
				isOpen={isRemoveDialogOpen}
				leastDestructiveRef={cancelRef}
				onClose={onRemoveDialogClose}
				isCentered
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.600">
							Remove Apartment from Approved List
						</AlertDialogHeader>

						<AlertDialogBody>
							<VStack spacing={4} align="stretch">
								<Text>
									Are you sure you want to remove <strong>{apartmentToRemove?.name}</strong> from approved apartments?
								</Text>
								<Text fontSize="sm" color="gray.600">
									This action will change the apartment status to "removed". The apartment will no longer appear in the approved apartments list but can be viewed in the removed apartments section.
								</Text>
								<FormControl>
									<FormLabel>Reason (Optional)</FormLabel>
									<Textarea
										value={removeReason}
										onChange={(e) => setRemoveReason(e.target.value)}
										placeholder="Enter reason for removal..."
										rows={3}
									/>
								</FormControl>
							</VStack>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onRemoveDialogClose}>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								isLoading={removingApartmentId === apartmentToRemove?.id}
								loadingText="Removing..."
								onClick={confirmRemoveApartment}
								ml={3}
							>
								Remove Apartment
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			{/* Delete Seasonal Pricing Confirmation Dialog */}
			<AlertDialog
				isOpen={isDeleteSeasonalDialogOpen}
				leastDestructiveRef={deleteSeasonalCancelRef}
				onClose={onDeleteSeasonalDialogClose}
				isCentered
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.600">
							Delete Seasonal Pricing
						</AlertDialogHeader>

						<AlertDialogBody>
							<VStack spacing={3} align="stretch">
								<Text>
									Are you sure you want to delete the seasonal pricing <strong>"{seasonalPricingToDelete?.name}"</strong>?
								</Text>
								{seasonalPricingToDelete && (
									<Box p={3} bg="gray.50" borderRadius="md">
										<Text fontSize="sm" color="gray.600" mb={1}>
											<strong>Details:</strong>
										</Text>
										<Text fontSize="sm" color="gray.700">
											Additional Fee: +₦{(seasonalPricingToDelete.additionalFee || 0).toLocaleString()} per night
										</Text>
										<Text fontSize="sm" color="gray.700">
											Period: {formatDateLabel(seasonalPricingToDelete.startDate)} — {formatDateLabel(seasonalPricingToDelete.endDate)}
										</Text>
									</Box>
								)}
								<Text fontSize="sm" color="gray.600">
									This action cannot be undone. The seasonal pricing will be permanently removed.
								</Text>
							</VStack>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={deleteSeasonalCancelRef} onClick={onDeleteSeasonalDialogClose}>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								isLoading={deletingSeasonalPricingId === seasonalPricingToDelete?._id}
								loadingText="Deleting..."
								onClick={confirmDeleteSeasonal}
								ml={3}
							>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Flex>
	);
};

export default ApprovedApartments;