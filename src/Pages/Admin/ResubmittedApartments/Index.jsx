import {
	Flex,
	Spinner,
	Button,
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
	Input,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	Checkbox,
	CheckboxGroup,
	IconButton,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	Avatar,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText
} from "@chakra-ui/react";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { FaWifi, FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaChevronLeft, FaChevronRight, FaTimes, FaRedo, FaClock, FaTrash, FaUpload, FaCheck, FaStar, FaRegStar } from "react-icons/fa";
import React, { useState, useEffect, Fragment } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import {
	AdminGetResubmittedApartmentsAPI,
	AdminGetResubmittedApartmentByIdAPI,
} from "../../../api/endpoints";
import {
	AdminApproveResubmittedApartmentAPI,
	AdminRejectResubmittedApartmentAPI,
	AdminUpdateApartmentAPI,
} from "../../../Endpoints";
import { createUploadService } from "../../../utils/uploadService";

const Index = () => {
	const [loading, setLoading] = useState(false);
	const [statusLoadingId, setStatusLoadingId] = useState(null);
	const [apartments, setApartments] = useState([]);
	const [selectedApartment, setSelectedApartment] = useState(null);
	const [apartmentDetailsLoading, setApartmentDetailsLoading] = useState(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [adminNotes, setAdminNotes] = useState("");
	const [approvalNote, setApprovalNote] = useState("");
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
	const [selectedMedia, setSelectedMedia] = useState(null);
	const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
	const [allMedia, setAllMedia] = useState([]);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isOpen: isRejectDialogOpen, onOpen: onRejectDialogOpen, onClose: onRejectDialogClose } = useDisclosure();
	const { isOpen: isApprovalDialogOpen, onClose: onApprovalDialogClose } = useDisclosure();
	const { isOpen: isApprovalConfirmOpen, onOpen: onApprovalConfirmOpen, onClose: onApprovalConfirmClose } = useDisclosure();
	const { isOpen: isMediaViewerOpen, onOpen: onMediaViewerOpen, onClose: onMediaViewerClose } = useDisclosure();
	const cancelRef = React.useRef();
	const toast = useToast();

	const fetchResubmittedApartments = async () => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			console.log('🔍 Fetching resubmitted apartments from:', AdminGetResubmittedApartmentsAPI);
			console.log('🔍 Auth token exists:', !!authToken);

			const response = await axios.get(AdminGetResubmittedApartmentsAPI, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				// Add timestamp to prevent caching
				params: {
					_t: Date.now()
				}
			});

			console.log('API Response Status:', response.status);
			console.log('API Response Data:', response.data);

			// Handle different response scenarios
			if (response.status === 304) {
				console.warn('Received 304 Not Modified - using cached data or forcing refresh');
				// Force a refresh by making another request with timestamp
				const freshResponse = await axios.get(AdminGetResubmittedApartmentsAPI, {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authToken}`,
					},
					params: {
						_t: Date.now(),
						_refresh: 'force'
					}
				});

				if (freshResponse.data?.success && freshResponse.data?.data?.apartments) {
					const apartmentsData = freshResponse.data.data.apartments;
					const mapped = apartmentsData.map((apt, index) => ({
						id: apt._id,
						sn: index + 1,
						apartmentName: apt.apartmentName,
						apartmentAddress: `${apt.address || 'N/A'}, ${apt.city || 'N/A'}, ${apt.state || 'N/A'}`,
						agentName: apt.agentId ? `${apt.agentId.firstName} ${apt.agentId.lastName}` : "No Agent",
						agentEmail: apt.agentId?.email || "N/A",
						agentPhone: apt.agentId?.phone ? `+${apt.agentId.phone}` : "N/A",
						status: apt.status,
						lastPushedAt: apt.lastPushedAt,
						pushCount: apt.pushCount || 0,
						isPreviousRejection: apt.isPreviousRejection || false,
						modificationsAfterRejection: apt.modificationsAfterRejection || false,
						canBePushed: apt.canBePushed,
						lastRejection: apt.lastRejection,
						rejectionTrail: apt.rejectionTrail || [],
					}));
					setApartments(mapped);
					return;
				}
			}

			if (response.data?.success && response.data?.data?.apartments) {
				const apartmentsData = response.data.data.apartments;
				const mapped = apartmentsData.map((apt, index) => ({
					id: apt._id,
					sn: index + 1,
					apartmentName: apt.apartmentName,
					apartmentAddress: `${apt.address || 'N/A'}, ${apt.city || 'N/A'}, ${apt.state || 'N/A'}`,
					agentName: apt.agentId ? `${apt.agentId.firstName} ${apt.agentId.lastName}` : "No Agent",
					agentEmail: apt.agentId?.email || "N/A",
					agentPhone: apt.agentId?.phone ? `+${apt.agentId.phone}` : "N/A",
					status: apt.status,
					lastPushedAt: apt.lastPushedAt,
					pushCount: apt.pushCount || 0,
					isPreviousRejection: apt.isPreviousRejection || false,
					modificationsAfterRejection: apt.modificationsAfterRejection || false,
					canBePushed: apt.canBePushed,
					lastRejection: apt.lastRejection,
					rejectionTrail: apt.rejectionTrail || [],
				}));
				setApartments(mapped);
			} else if (response.data?.success === false) {
				throw new Error(response.data.message || "API returned unsuccessful response");
			} else if (response.status === 200 && (!response.data?.data?.apartments || response.data.data.apartments.length === 0)) {
				// Handle case where API returns 200 but no apartments
				console.log('No Resubmitted Apartments found');
				setApartments([]);
				toast({
					title: "No Resubmitted Apartments",
					description: "There are currently no apartments that have been resubmitted for review.",
					status: "info",
					duration: 3000,
					isClosable: true,
				});
			} else {
				throw new Error(`Unexpected response format. Status: ${response.status}`);
			}
		} catch (error) {
			console.error("Error fetching resubmitted apartments:", error);

			let errorMessage = "An unexpected error occurred";
			let errorTitle = "Error";

			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				switch (error.response.status) {
					case 304:
						errorTitle = "Cache Issue";
						errorMessage = "Data not modified. Please try refreshing the page or clearing your browser cache.";
						break;
					case 401:
						errorTitle = "Authentication Error";
						errorMessage = "Your session has expired. Please log in again.";
						break;
					case 403:
						errorTitle = "Access Denied";
						errorMessage = "You don't have permission to view resubmitted apartments.";
						break;
					case 404:
						errorTitle = "Endpoint Not Found";
						errorMessage = "The resubmitted apartments endpoint was not found. Please contact support.";
						break;
					case 500:
						errorTitle = "Server Error";
						errorMessage = "Internal server error. Please try again later or contact support.";
						break;
					default:
						errorMessage = error.response?.data?.message || `Server responded with status ${error.response.status}`;
				}
			} else if (error.request) {
				// The request was made but no response was received
				errorTitle = "Network Error";
				errorMessage = "Unable to reach the server. Please check your internet connection.";
			} else {
				// Something happened in setting up the request that triggered an Error
				errorMessage = error.message;
			}

			toast({
				title: errorTitle,
				description: errorMessage,
				status: "error",
				duration: 8000,
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

			const response = await axios.get(AdminGetResubmittedApartmentByIdAPI(apartmentId), {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			if (response.data?.success && response.data?.data) {
				// The apartment data is directly in response.data.data
				const apartmentDetails = {
					...response.data.data,
					// The API response already includes all the resubmission fields we need
				};

				setSelectedApartment(apartmentDetails);
				onOpen();
				console.log("Resubmitted Apartment details fetched successfully:", apartmentDetails);
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

	const handleStatusChange = async (apartmentId, action, reason = null, adminNotesText = null) => {
		setStatusLoadingId(apartmentId);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) throw new Error("No authentication token found");

			let endpoint, requestBody;

			if (action === "approve") {
				endpoint = AdminApproveResubmittedApartmentAPI(apartmentId);
				requestBody = {}; // Approve endpoint typically doesn't need body data
			} else {
				endpoint = AdminRejectResubmittedApartmentAPI(apartmentId);
				requestBody = {
					reason: reason || "",
					adminNotes: adminNotesText || ""
				};
			}

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
			fetchResubmittedApartments();

			// Close modals and reset fields
			onClose();
			if (action === "reject") {
				onRejectDialogClose();
				setRejectionReason("");
				setAdminNotes("");
			} else {
				onApprovalDialogClose();
				setApprovalNote("");
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
		if (!adminNotes.trim()) {
			toast({
				title: "Error",
				description: "Please provide admin notes",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}
		handleStatusChange(selectedApartment._id, "reject", rejectionReason, adminNotes);
	};

	const handleApproveApartment = () => {
		handleStatusChange(selectedApartment._id, "approve");
		onApprovalConfirmClose();
	};

	const handleEditApartment = () => {
		setIsEditMode(true);
		setEditedApartment({ ...selectedApartment });
	};

	const handleCancelEdit = () => {
		setIsEditMode(false);
		setEditedApartment(null);
		setNewImages([]);
		setNewVideos([]);
		setDeletedImages([]);
		setDeletedVideos([]);
		setFavoriteImageIndex(null);
	};

	const handleModalClose = () => {
		setIsEditMode(false);
		setEditedApartment(null);
		setNewImages([]);
		setNewVideos([]);
		setDeletedImages([]);
		setDeletedVideos([]);
		setFavoriteImageIndex(null);
		onClose();
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
						// For videos, create a preview thumbnail
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
		// Only allow images (not videos) to be favorite images
		const targetArray = isExisting ? editedApartment?.media?.images : newImages;
		const targetItem = isExisting ? targetArray?.[index] : targetArray?.[index];

		if (!targetItem) return;

		// For new images, check the type
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

		// Calculate the global index for the favorite image
		const globalIndex = isExisting ? index : (editedApartment?.media?.images?.length || 0) + index;
		const newFavoriteIndex = favoriteImageIndex === globalIndex ? null : globalIndex;
		setFavoriteImageIndex(newFavoriteIndex);

		// Update the media arrays with favorite status
		if (!isExisting) {
			const updatedNewImages = newImages.map((item, i) => ({
				...item,
				isFavorite: i === index && newFavoriteIndex !== null
			}));
			setNewImages(updatedNewImages);
		}

		// Show feedback message
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

			// Upload new media first
			let uploadedUrls = [];

			if (newImages.length > 0 || newVideos.length > 0) {
				setUploadingMedia(true);

				try {
					// Combine all files for batch upload
					const allFiles = [
						...newImages.map(img => img.file),
						...newVideos.map(vid => vid.file)
					];

					const uploadService = createUploadService(authToken);

					// Update progress for each file
					const handleUploadProgress = (fileIndex, progress) => {
						if (fileIndex < newImages.length) {
							// Update image progress
							setNewImages(prev => prev.map((item, index) =>
								index === fileIndex
									? { ...item, uploadProgress: progress.progress, uploadStatus: progress.status }
									: item
							));
						} else {
							// Update video progress
							const videoIndex = fileIndex - newImages.length;
							setNewVideos(prev => prev.map((item, index) =>
								index === videoIndex
									? { ...item, uploadProgress: progress.progress, uploadStatus: progress.status }
									: item
							));
						}
					};

					uploadedUrls = await uploadService.uploadMultipleFiles(allFiles, handleUploadProgress);

					toast({
						title: "Media Uploaded",
						description: `Successfully uploaded ${uploadedUrls.length} files`,
						status: "success",
						duration: 3000,
						isClosable: true,
					});

				} catch (error) {
					console.error('Failed to upload media:', error);
					toast({
						title: "Upload Failed",
						description: error.message || "Failed to upload media files",
						status: "error",
						duration: 5000,
						isClosable: true,
					});
					setUploadingMedia(false);
					return;
				}

				setUploadingMedia(false);
			}

			// Create update payload with only changed fields
			const updatePayload = {};
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
			if (JSON.stringify(editedApartment.optionalFees) !== JSON.stringify(selectedApartment.optionalFees)) {
				updatePayload.optionalFees = editedApartment.optionalFees;
			}
			if (JSON.stringify(editedApartment.contact_details) !== JSON.stringify(selectedApartment.contact_details)) {
				updatePayload.contact_details = editedApartment.contact_details;
			}
			if (JSON.stringify(editedApartment.accessDetails) !== JSON.stringify(selectedApartment.accessDetails)) {
				updatePayload.accessDetails = editedApartment.accessDetails;
			}
			if (JSON.stringify(editedApartment.amenities) !== JSON.stringify(selectedApartment.amenities)) {
				updatePayload.amenities = editedApartment.amenities;
			}

			// Handle media updates
			if (uploadedUrls.length > 0 || deletedImages.length > 0 || deletedVideos.length > 0 || favoriteImageIndex !== null) {
				const currentImages = editedApartment.media?.images || [];
				const currentVideos = editedApartment.media?.videos || [];

				// Split uploaded URLs by type
				const newImageUrls = uploadedUrls.slice(0, newImages.length);
				const newVideoUrls = uploadedUrls.slice(newImages.length);

				// Combine all images (existing + new)
				const allImages = [...currentImages, ...newImageUrls];

				updatePayload.media = {
					images: allImages,
					videos: [...currentVideos, ...newVideoUrls],
					// Include favorite image information
					favoriteImageIndex: favoriteImageIndex,
					favoriteImageUrl: favoriteImageIndex !== null && allImages[favoriteImageIndex] ? allImages[favoriteImageIndex] : null
				};
			}

			// Handle favorite image changes even without media uploads
			if (favoriteImageIndex !== null && !updatePayload.media) {
				const currentImages = editedApartment.media?.images || [];
				const currentVideos = editedApartment.media?.videos || [];

				updatePayload.media = {
					images: currentImages,
					videos: currentVideos,
					favoriteImageIndex: favoriteImageIndex,
					favoriteImageUrl: favoriteImageIndex !== null && currentImages[favoriteImageIndex] ? currentImages[favoriteImageIndex] : null
				};
			}

			// Only proceed if there are changes
			if (Object.keys(updatePayload).length === 0) {
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

			await axios.put(AdminUpdateApartmentAPI(selectedApartment._id), updatePayload, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			});

			toast({
				title: "Apartment Updated",
				description: "Apartment details have been updated successfully",
				status: "success",
				duration: 4000,
				isClosable: true,
			});

			// Update the selected apartment with new data
			const updatedApartment = {
				...editedApartment,
				media: updatePayload.media || editedApartment.media
			};
			setSelectedApartment(updatedApartment);
			setIsEditMode(false);
			setEditedApartment(null);
			setNewImages([]);
			setNewVideos([]);
			setDeletedImages([]);
			setDeletedVideos([]);

			// Optionally refetch the apartment list
			fetchResubmittedApartments();

		} catch (error) {
			console.error("Error updating apartment:", error);
			toast({
				title: "Update Failed",
				description: error.response?.data?.message || "Failed to update apartment",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setUpdateLoading(false);
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
		const newIndex = direction === 'next'
			? (currentMediaIndex + 1) % allMedia.length
			: (currentMediaIndex - 1 + allMedia.length) % allMedia.length;

		setCurrentMediaIndex(newIndex);
		setSelectedMedia(allMedia[newIndex]);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
	};

	useEffect(() => {
		fetchResubmittedApartments();
	}, []);

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
						{rowData.apartmentAddress}
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

	const statusTemplate = (rowData) => {
		return (
			<Badge colorScheme="orange" variant="subtle" borderRadius="full" px={3} py={1}>
				{rowData.status}
			</Badge>
		);
	};

	const pushCountTemplate = (rowData) => {
		return (
			<Badge
				colorScheme={rowData.pushCount > 0 ? "blue" : "gray"}
				variant="subtle"
				borderRadius="full"
				px={3}
				py={1}
			>
				{rowData.pushCount}
			</Badge>
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

	// Calculate statistics
	const totalResubmitted = apartments.length;
	const previouslyRejected = apartments.filter(apt => apt.isPreviousRejection).length;
	const withModifications = apartments.filter(apt => apt.modificationsAfterRejection).length;
	const totalPushes = apartments.reduce((sum, apt) => sum + (apt.pushCount || 0), 0);

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<Spinner size="xl" />
				</Flex>
			) : (
				<>
					{/* Statistics Cards */}
					<SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px" mb="30px">
						<Card p="20px" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Total Resubmitted</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{totalResubmitted}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Pending review</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Previously Rejected</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{previouslyRejected}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>Resubmissions</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>With Modifications</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{withModifications}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>After rejection</StatHelpText>
							</Stat>
						</Card>

						<Card p="20px" bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" color="white">
							<Stat>
								<StatLabel fontSize="md" opacity={0.8}>Total Pushes</StatLabel>
								<StatNumber fontSize="2xl" fontWeight="bold">{totalPushes}</StatNumber>
								<StatHelpText fontSize="sm" opacity={0.7}>All submissions</StatHelpText>
							</Stat>
						</Card>
					</SimpleGrid>

					{/* Main Table Card */}
					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<Flex justify="space-between" align="center" w="100%">
								<VStack align="start" spacing={1}>
									<Text fontSize="2xl" fontWeight="bold" color="gray.800">
										Resubmitted Apartments
									</Text>
									<Text fontSize="md" color="gray.500">
										Review and manage apartment resubmissions
									</Text>
								</VStack>
								<HStack spacing={3}>
									<Badge
										colorScheme={apartments.length > 0 ? "orange" : "gray"}
										fontSize="md"
										px={4}
										py={2}
										borderRadius="full"
									>
										<Icon as={FaClock} mr={2} />
										{apartments.length} Pending Review
									</Badge>
									<Button
										size="sm"
										colorScheme="blue"
										variant="outline"
										leftIcon={<Icon as={FaRedo} />}
										onClick={() => fetchResubmittedApartments()}
										isLoading={loading}
										borderRadius="full"
									>
										Refresh
									</Button>
								</HStack>
							</Flex>
						</CardHeader>

						<CardBody display={"block"}>
							<Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
								<DataTable
									value={apartments}
									paginator
									rows={10}
									rowsPerPageOptions={[5, 10, 25, 50]}
									loading={loading}
									stripedRows
									rowHover
									scrollable
									scrollHeight="600px"
									globalFilterFields={['apartmentName', 'agentName', 'agentEmail', 'apartmentAddress']}
									emptyMessage={
										<Box textAlign="center" py={8}>
											<VStack spacing={4}>
												<Icon as={FaClock} boxSize="48px" color="gray.400" />
												<Text fontSize="lg" fontWeight="semibold" color="gray.600">
													No Resubmitted Apartments
												</Text>
												<Text fontSize="sm" color="gray.500" maxW="400px" textAlign="center">
													There are currently no apartments that have been resubmitted by agents for review.
												</Text>
												<Button
													size="sm"
													colorScheme="blue"
													variant="ghost"
													leftIcon={<Icon as={FaRedo} />}
													onClick={() => fetchResubmittedApartments()}
												>
													Check Again
												</Button>
											</VStack>
										</Box>
									}
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
										field="pushCount"
										header="Push Count"
										body={pushCountTemplate}
										sortable
										style={{ width: "10%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>
									<Column
										field="modificationsAfterRejection"
										header="Modifications"
										body={(row) => (
											<Badge
												colorScheme={row.modificationsAfterRejection ? "green" : "gray"}
												variant="subtle"
												borderRadius="full"
												px={3}
												py={1}
												fontSize="xs"
											>
												{row.modificationsAfterRejection ? "Modified" : "No Changes"}
											</Badge>
										)}
										style={{ width: "15%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>
									<Column
										field="lastPushedAt"
										header="Last Submitted"
										body={(row) => (
											<Text fontSize="sm" color="gray.600">
												{row.lastPushedAt ? formatDate(row.lastPushedAt) : "N/A"}
											</Text>
										)}
										sortable
										style={{ width: "15%", padding: "16px" }}
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
										header="Actions"
										body={actionTemplate}
										style={{ width: "10%", padding: "16px" }}
										headerStyle={{ backgroundColor: "#f8f9fa", fontWeight: "600", padding: "16px" }}
									/>
								</DataTable>
							</Box>
						</CardBody>
					</Card>
				</>
			)}

			{/* Apartment Details Modal - Same as the original but with different action buttons */}
			<Modal isOpen={isOpen} onClose={handleModalClose} size="6xl">
				<ModalOverlay />
				<ModalContent maxH="90vh" overflowY="auto">
					<ModalHeader>
						<Flex justify="space-between" align="center">
							<VStack align="start" spacing={1}>
								<Text fontSize="xl" fontWeight="bold" color="#de9301">
									{selectedApartment?.apartmentName || "Apartment Details"}
								</Text>
								<HStack>
									{selectedApartment && (
										<Badge
											colorScheme={
												selectedApartment.status === "approved" ? "green" :
													selectedApartment.status === "rejected" ? "red" :
														selectedApartment.status === "under_review" ? "yellow" : "gray"
											}
											fontSize="sm"
										>
											{selectedApartment.status?.toUpperCase().replace('_', ' ')}
										</Badge>
									)}
									{selectedApartment?.pushCount && (
										<Badge colorScheme="blue" fontSize="sm">
											<Icon as={FaRedo} mr={1} />
											Push Count: {selectedApartment.pushCount}
										</Badge>
									)}
								</HStack>
							</VStack>
							<HStack spacing={2}>
								{!isEditMode ? (
									<Button
										size="sm"
										colorScheme="orange"
										variant="outline"
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
									<Tab>Rejection History</Tab>
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
																leftIcon={<FaUpload />}
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
																leftIcon={<FaUpload />}
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
																			icon={favoriteImageIndex === ((editedApartment?.media?.images?.length || 0) + index) ? <FaStar /> : <FaRegStar />}
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
																			bottom={imageObj.uploadStatus && imageObj.uploadStatus !== 'pending' ? "32px" : "8px"}
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

																	{/* Upload Progress Overlay */}
																	{imageObj.uploadStatus && imageObj.uploadStatus !== 'pending' && (
																		<Box
																			position="absolute"
																			bottom={0}
																			left={0}
																			right={0}
																			bg="rgba(0,0,0,0.8)"
																			borderBottomRadius="md"
																			p={2}
																			minH="32px"
																			display="flex"
																			alignItems="center"
																			justifyContent="center"
																		>
																			{imageObj.uploadStatus === 'uploading' ? (
																				<Flex align="center" gap={2}>
																					<Spinner size="sm" color="white" />
																					<Text color="white" fontSize="sm">
																						{imageObj.uploadProgress || 0}%
																					</Text>
																				</Flex>
																			) : imageObj.uploadStatus === 'completed' ? (
																				<Flex align="center" gap={2} color="green.400">
																					<FaCheck />
																					<Text fontSize="sm">Done</Text>
																				</Flex>
																			) : imageObj.uploadStatus === 'failed' ? (
																				<Flex align="center" gap={2} color="red.400">
																					<FaTimes />
																					<Text fontSize="sm">Failed</Text>
																				</Flex>
																			) : null}
																		</Box>
																	)}

																	<IconButton
																		icon={<FaTimes />}
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
																			icon={favoriteImageIndex === index ? <FaStar /> : <FaRegStar />}
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
																			icon={<FaTrash />}
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

																	{/* Upload Progress Overlay */}
																	{videoObj.uploadStatus && videoObj.uploadStatus !== 'pending' && (
																		<Box
																			position="absolute"
																			bottom={0}
																			left={0}
																			right={0}
																			bg="rgba(0,0,0,0.8)"
																			borderBottomRadius="md"
																			p={2}
																			minH="32px"
																			display="flex"
																			alignItems="center"
																			justifyContent="center"
																		>
																			{videoObj.uploadStatus === 'uploading' ? (
																				<Flex align="center" gap={2}>
																					<Spinner size="sm" color="white" />
																					<Text color="white" fontSize="sm">
																						{videoObj.uploadProgress || 0}%
																					</Text>
																				</Flex>
																			) : videoObj.uploadStatus === 'completed' ? (
																				<Flex align="center" gap={2} color="green.400">
																					<FaCheck />
																					<Text fontSize="sm">Done</Text>
																				</Flex>
																			) : videoObj.uploadStatus === 'failed' ? (
																				<Flex align="center" gap={2} color="red.400">
																					<FaTimes />
																					<Text fontSize="sm">Failed</Text>
																				</Flex>
																			) : null}
																		</Box>
																	)}

																	<IconButton
																		icon={<FaTimes />}
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
																				icon={<FaTrash />}
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
														{!isEditMode ? (
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
														) : (
															<Stack spacing={4}>
																<FormControl>
																	<FormLabel>Apartment Name</FormLabel>
																	<Input
																		value={editedApartment?.apartmentName || ""}
																		onChange={(e) => setEditedApartment(prev => ({ ...prev, apartmentName: e.target.value }))}
																		placeholder="Enter apartment name"
																	/>
																</FormControl>

																<FormControl>
																	<FormLabel>Address</FormLabel>
																	<Input
																		value={editedApartment?.address || ""}
																		onChange={(e) => setEditedApartment(prev => ({ ...prev, address: e.target.value }))}
																		placeholder="Enter address"
																	/>
																</FormControl>

																<Flex gap={4}>
																	<FormControl>
																		<FormLabel>City</FormLabel>
																		<Input
																			value={editedApartment?.city || ""}
																			onChange={(e) => setEditedApartment(prev => ({ ...prev, city: e.target.value }))}
																			placeholder="Enter city"
																		/>
																	</FormControl>
																	<FormControl>
																		<FormLabel>State</FormLabel>
																		<Input
																			value={editedApartment?.state || ""}
																			onChange={(e) => setEditedApartment(prev => ({ ...prev, state: e.target.value }))}
																			placeholder="Enter state"
																		/>
																	</FormControl>
																</Flex>

																<Flex gap={4}>
																	<FormControl>
																		<FormLabel>Bedrooms</FormLabel>
																		<NumberInput
																			value={editedApartment?.bedrooms || 0}
																			onChange={(value) => setEditedApartment(prev => ({ ...prev, bedrooms: parseInt(value) || 0 }))}
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
																			value={editedApartment?.bathrooms || 0}
																			onChange={(value) => setEditedApartment(prev => ({ ...prev, bathrooms: parseInt(value) || 0 }))}
																			min={0}
																		>
																			<NumberInputField />
																			<NumberInputStepper>
																				<NumberIncrementStepper />
																				<NumberDecrementStepper />
																			</NumberInputStepper>
																		</NumberInput>
																	</FormControl>
																</Flex>

																<Flex gap={4}>
																	<FormControl>
																		<FormLabel>Beds</FormLabel>
																		<NumberInput
																			value={editedApartment?.beds || 0}
																			onChange={(value) => setEditedApartment(prev => ({ ...prev, beds: parseInt(value) || 0 }))}
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
																			value={editedApartment?.guests || 0}
																			onChange={(value) => setEditedApartment(prev => ({ ...prev, guests: parseInt(value) || 0 }))}
																			min={0}
																		>
																			<NumberInputField />
																			<NumberInputStepper>
																				<NumberIncrementStepper />
																				<NumberDecrementStepper />
																			</NumberInputStepper>
																		</NumberInput>
																	</FormControl>
																</Flex>
															</Stack>
														)}
													</Box>

													<Box p={4} bg="gray.50" borderRadius="md">
														<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
															Description
														</Text>
														{!isEditMode ? (
															<Text>{selectedApartment.description || "No description available"}</Text>
														) : (
															<FormControl>
																<Textarea
																	value={editedApartment?.description || ""}
																	onChange={(e) => setEditedApartment(prev => ({ ...prev, description: e.target.value }))}
																	placeholder="Enter apartment description"
																	minH="100px"
																	resize="vertical"
																/>
															</FormControl>
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
													{/* Resubmission Info */}
													<Box p={4} bg="yellow.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="yellow.400">
														<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
															Resubmission Information
														</Text>
														<Stack spacing={2}>
															<Text><strong>Push Count:</strong> {selectedApartment.pushCount}</Text>
															<Text><strong>Last Pushed:</strong> {selectedApartment.lastPushedAt ? formatDate(selectedApartment.lastPushedAt) : "N/A"}</Text>
															<Text><strong>Can Be Pushed:</strong> {selectedApartment.canBePushed ? "Yes" : "No"}</Text>
														</Stack>
													</Box>

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

									{/* Rejection History Tab */}
									<TabPanel>
										<VStack spacing={6} align="stretch">
											{/* Current Rejection Status */}
											{selectedApartment.isPreviousRejection && (
												<Box p={4} bg="red.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="red.400">
													<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
														Current Status
													</Text>
													<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
														<Box>
															<Text><strong>Previously Rejected:</strong> Yes</Text>
															<Text><strong>Modifications Made:</strong> {selectedApartment.modificationsAfterRejection ? "Yes" : "No"}</Text>
															<Text><strong>Can Be Pushed:</strong> {selectedApartment.canBePushed ? "Yes" : "No"}</Text>
														</Box>
														{selectedApartment.lastRejection && (
															<Box>
																<Text><strong>Last Rejection:</strong> {formatDate(selectedApartment.lastRejection.rejectedAt)}</Text>
																<Text><strong>Agent Notified:</strong> {selectedApartment.lastRejection.agentNotified ? "Yes" : "No"}</Text>
															</Box>
														)}
													</Grid>
												</Box>
											)}

											{/* Latest Rejection Details */}
											{selectedApartment.lastRejection && (
												<Box p={4} bg="orange.50" borderRadius="md">
													<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
														Latest Rejection Details
													</Text>
													<VStack align="stretch" spacing={3}>
														<Box p={3} bg="white" borderRadius="md" borderLeft="3px solid" borderLeftColor="red.400">
															<Text fontSize="sm" color="gray.600" mb={1}>
																Rejected on {formatDate(selectedApartment.lastRejection.rejectedAt)}
															</Text>
															<Text fontSize="md" fontWeight="semibold" mb={2}>
																Reason:
															</Text>
															<Text fontSize="sm" bg="red.50" p={2} borderRadius="md">
																{selectedApartment.lastRejection.reason}
															</Text>
														</Box>

														{selectedApartment.lastRejection.adminNotes && (
															<Box p={3} bg="white" borderRadius="md" borderLeft="3px solid" borderLeftColor="blue.400">
																<Text fontSize="md" fontWeight="semibold" mb={2}>
																	Admin Notes:
																</Text>
																<Text fontSize="sm" bg="blue.50" p={2} borderRadius="md">
																	{selectedApartment.lastRejection.adminNotes}
																</Text>
															</Box>
														)}

														{selectedApartment.lastRejection.rejectedBy && (
															<Box p={3} bg="white" borderRadius="md">
																<Text fontSize="sm" color="gray.600">
																	<strong>Rejected by:</strong> {selectedApartment.lastRejection.rejectedBy.firstName} {selectedApartment.lastRejection.rejectedBy.lastName}
																</Text>
															</Box>
														)}
													</VStack>
												</Box>
											)}

											{/* Complete Rejection History */}
											{selectedApartment.rejectionTrail && selectedApartment.rejectionTrail.length > 0 && (
												<Box p={4} bg="gray.50" borderRadius="md">
													<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
														Complete Rejection History ({selectedApartment.rejectionTrail.length} rejection{selectedApartment.rejectionTrail.length > 1 ? 's' : ''})
													</Text>
													<VStack spacing={4} align="stretch">
														{selectedApartment.rejectionTrail.map((rejection, index) => (
															<Box key={index} p={4} bg="white" borderRadius="md" boxShadow="sm" position="relative">
																<Badge
																	position="absolute"
																	top={2}
																	right={2}
																	colorScheme="red"
																	fontSize="xs"
																>
																	#{selectedApartment.rejectionTrail.length - index}
																</Badge>

																<Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
																	<VStack align="stretch" spacing={3}>
																		<Box>
																			<Text fontSize="sm" color="gray.600" mb={1}>
																				{formatDate(rejection.rejectedAt)}
																			</Text>
																			<Text fontSize="md" fontWeight="semibold" mb={2}>
																				Rejection Reason:
																			</Text>
																			<Text fontSize="sm" bg="red.50" p={2} borderRadius="md">
																				{rejection.reason}
																			</Text>
																		</Box>

																		{rejection.adminNotes && (
																			<Box>
																				<Text fontSize="md" fontWeight="semibold" mb={2}>
																					Admin Notes:
																				</Text>
																				<Text fontSize="sm" bg="blue.50" p={2} borderRadius="md">
																					{rejection.adminNotes}
																				</Text>
																			</Box>
																		)}
																	</VStack>

																	<VStack align="stretch" spacing={2}>
																		{rejection.rejectedBy && (
																			<Box p={2} bg="gray.100" borderRadius="md">
																				<Text fontSize="xs" color="gray.600" fontWeight="semibold">REJECTED BY</Text>
																				<Text fontSize="sm">{rejection.rejectedBy.firstName} {rejection.rejectedBy.lastName}</Text>
																			</Box>
																		)}

																		<Box p={2} bg="gray.100" borderRadius="md">
																			<Text fontSize="xs" color="gray.600" fontWeight="semibold">STATUS</Text>
																			<HStack spacing={2} mt={1}>
																				<Badge colorScheme={rejection.agentNotified ? "green" : "yellow"} fontSize="xs">
																					{rejection.agentNotified ? "Agent Notified" : "Pending Notification"}
																				</Badge>
																				<Badge colorScheme={rejection.modificationsMade ? "blue" : "gray"} fontSize="xs">
																					{rejection.modificationsMade ? "Modified" : "No Changes"}
																				</Badge>
																			</HStack>
																		</Box>
																	</VStack>
																</Grid>
															</Box>
														))}
													</VStack>
												</Box>
											)}

											{/* No Rejection History */}
											{(!selectedApartment.isPreviousRejection && (!selectedApartment.rejectionTrail || selectedApartment.rejectionTrail.length === 0)) && (
												<Box textAlign="center" py={8}>
													<Text color="gray.500" fontSize="md">
														No rejection history available for this apartment
													</Text>
													<Text color="gray.400" fontSize="sm" mt={2}>
														This apartment may be a first-time submission
													</Text>
												</Box>
											)}
										</VStack>
									</TabPanel>

									{/* Amenities Tab */}
									<TabPanel>
										<Box>
											<Text fontSize="lg" fontWeight="bold" mb={4} color="#de9301">
												Available Amenities
											</Text>
											{!isEditMode ? (
												<SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
													{selectedApartment.amenities?.map((amenity, index) => (
														<Box key={index} p={3} bg="gray.50" borderRadius="md" textAlign="center">
															<Text fontWeight="medium">{amenity}</Text>
														</Box>
													))}
												</SimpleGrid>
											) : (
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
														<Text fontSize="sm" fontWeight="bold" mb={2}>Custom Amenity:</Text>
														<Flex gap={2}>
															<Input
																placeholder="Add custom amenity"
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
															<Text fontSize="sm" color="gray.500" alignSelf="center">
																Press Enter to add
															</Text>
														</Flex>
													</Box>
												</VStack>
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
													{!isEditMode ? (
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
													) : (
														<Stack spacing={4}>
															<FormControl>
																<FormLabel>Default Stay Fee (₦)</FormLabel>
																<NumberInput
																	value={editedApartment?.defaultStayFee || 0}
																	onChange={(value) => setEditedApartment(prev => ({ ...prev, defaultStayFee: parseInt(value) || 0 }))}
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
																	value={editedApartment?.cautionFee || 0}
																	onChange={(value) => setEditedApartment(prev => ({ ...prev, cautionFee: parseInt(value) || 0 }))}
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
													)}
												</Box>
											</GridItem>

											<GridItem>
												<Box p={4} bg="blue.50" borderRadius="md">
													<Text fontSize="lg" fontWeight="bold" mb={3} color="#de9301">
														Optional Fees
													</Text>
													{!isEditMode ? (
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
													) : (
														<Stack spacing={4}>
															<FormControl>
																<FormLabel>Party Fee (₦)</FormLabel>
																<NumberInput
																	value={editedApartment?.optionalFees?.partyFee || 0}
																	onChange={(value) => setEditedApartment(prev => ({
																		...prev,
																		optionalFees: {
																			...prev.optionalFees,
																			partyFee: parseInt(value) || 0
																		}
																	}))}
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
																	value={editedApartment?.optionalFees?.movieShootFee || 0}
																	onChange={(value) => setEditedApartment(prev => ({
																		...prev,
																		optionalFees: {
																			...prev.optionalFees,
																			movieShootFee: parseInt(value) || 0
																		}
																	}))}
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
																	value={editedApartment?.optionalFees?.photoShootFee || 0}
																	onChange={(value) => setEditedApartment(prev => ({
																		...prev,
																		optionalFees: {
																			...prev.optionalFees,
																			photoShootFee: parseInt(value) || 0
																		}
																	}))}
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
											{!isEditMode ? (
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
											) : (
												<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
													<GridItem>
														<Stack spacing={4}>
															<FormControl>
																<FormLabel>Contact Person Name</FormLabel>
																<Input
																	value={editedApartment?.contact_details?.contactPersonName || ""}
																	onChange={(e) => setEditedApartment(prev => ({
																		...prev,
																		contact_details: {
																			...prev.contact_details,
																			contactPersonName: e.target.value
																		}
																	}))}
																	placeholder="Enter contact person name"
																/>
															</FormControl>
															<FormControl>
																<FormLabel>Contact Person Role</FormLabel>
																<Input
																	value={editedApartment?.contact_details?.contactPersonRole || ""}
																	onChange={(e) => setEditedApartment(prev => ({
																		...prev,
																		contact_details: {
																			...prev.contact_details,
																			contactPersonRole: e.target.value
																		}
																	}))}
																	placeholder="Enter contact person role"
																/>
															</FormControl>
															<FormControl>
																<FormLabel>Phone Number</FormLabel>
																<Input
																	value={editedApartment?.contact_details?.phone || ""}
																	onChange={(e) => setEditedApartment(prev => ({
																		...prev,
																		contact_details: {
																			...prev.contact_details,
																			phone: e.target.value
																		}
																	}))}
																	placeholder="Enter phone number"
																/>
															</FormControl>
															<FormControl>
																<FormLabel>WhatsApp Number</FormLabel>
																<Input
																	value={editedApartment?.contact_details?.whatsappNumber || ""}
																	onChange={(e) => setEditedApartment(prev => ({
																		...prev,
																		contact_details: {
																			...prev.contact_details,
																			whatsappNumber: e.target.value
																		}
																	}))}
																	placeholder="Enter WhatsApp number"
																/>
															</FormControl>
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
											{!isEditMode ? (
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
											) : (
												<Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
													<GridItem>
														<FormControl>
															<FormLabel>WiFi Code</FormLabel>
															<Input
																value={editedApartment?.accessDetails?.wifiCode || ""}
																onChange={(e) => setEditedApartment(prev => ({
																	...prev,
																	accessDetails: {
																		...prev.accessDetails,
																		wifiCode: e.target.value
																	}
																}))}
																placeholder="Enter WiFi code"
																fontFamily="mono"
															/>
														</FormControl>
													</GridItem>
													<GridItem>
														<FormControl>
															<FormLabel>Door Code</FormLabel>
															<Input
																value={editedApartment?.accessDetails?.doorCode || ""}
																onChange={(e) => setEditedApartment(prev => ({
																	...prev,
																	accessDetails: {
																		...prev.accessDetails,
																		doorCode: e.target.value
																	}
																}))}
																placeholder="Enter door code"
																fontFamily="mono"
															/>
														</FormControl>
													</GridItem>
													<GridItem>
														<FormControl>
															<FormLabel>Access Code</FormLabel>
															<Input
																value={editedApartment?.accessDetails?.accessCode || ""}
																onChange={(e) => setEditedApartment(prev => ({
																	...prev,
																	accessDetails: {
																		...prev.accessDetails,
																		accessCode: e.target.value
																	}
																}))}
																placeholder="Enter access code"
																fontFamily="mono"
															/>
														</FormControl>
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
						<HStack spacing={3}>
							<Button colorScheme="gray" onClick={handleModalClose}>
								Close
							</Button>
							{selectedApartment && (selectedApartment.status === "under_review" || selectedApartment.status === "pending") && (
								<>
									<Button
										colorScheme="green"
										isLoading={statusLoadingId === selectedApartment._id}
										onClick={onApprovalConfirmOpen}
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

			{/* Media Viewer Modal - Same as original */}
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
							Reject Resubmitted Apartment: {selectedApartment?.apartmentName}
						</AlertDialogHeader>

						<AlertDialogBody>
							<VStack spacing={4} align="stretch">
								<FormControl isRequired>
									<FormLabel>Reason for rejection</FormLabel>
									<Textarea
										placeholder="Please provide a detailed reason for rejecting this resubmitted apartment..."
										value={rejectionReason}
										onChange={(e) => setRejectionReason(e.target.value)}
										resize="vertical"
										minH="100px"
									/>
								</FormControl>

								<FormControl isRequired>
									<FormLabel>Admin Notes</FormLabel>
									<Textarea
										placeholder="Please upload high-quality photos and provide detailed descriptions"
										value={adminNotes}
										onChange={(e) => setAdminNotes(e.target.value)}
										resize="vertical"
										minH="100px"
									/>
								</FormControl>
							</VStack>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={() => {
								setRejectionReason("");
								setAdminNotes("");
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
							Approve Resubmitted Apartment: {selectedApartment?.apartmentName}
						</AlertDialogHeader>
						<AlertDialogBody>
							<FormControl isRequired>
								<FormLabel>Reason for Approval</FormLabel>
								<Textarea
									placeholder="Please provide a reason/note for approving this resubmitted apartment..."
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

			{/* Approval Confirmation Dialog */}
			<AlertDialog
				isOpen={isApprovalConfirmOpen}
				leastDestructiveRef={cancelRef}
				onClose={onApprovalConfirmClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Approve Apartment: {selectedApartment?.apartmentName}
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure you want to approve this apartment? This action cannot be undone.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onApprovalConfirmClose}>
								Cancel
							</Button>
							<Button
								colorScheme="green"
								ml={3}
								isLoading={statusLoadingId === selectedApartment?._id}
								onClick={handleApproveApartment}
							>
								Yes, Approve
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Flex>
	);
};

export default Index;
