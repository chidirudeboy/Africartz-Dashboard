import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Flex,
	Grid,
	GridItem,
	HStack,
	Icon,
	Input,
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
	Text,
	Textarea,
	useDisclosure,
	useToast,
	VStack,
	Checkbox,
	CheckboxGroup,
	Select,
} from "@chakra-ui/react";
import axios from "axios";
import {
	FaBullhorn,
	FaCircleCheck,
	FaCircleInfo,
	FaPenToSquare,
	FaPlus,
	FaTriangleExclamation,
	FaCalendarDays,
	FaWandMagicSparkles,
	FaTrash,
} from "react-icons/fa6";
import Card from "../../../components/Card/Card";
import CardBody from "../../../components/Card/CardBody";
import CardHeader from "../../../components/Card/CardHeader";
import GlobalContext from "../../../Context";
import {
	AdminChangeAnnouncementStatusAPI,
	AdminCreateAnnouncementAPI,
	AdminDeleteAnnouncementAPI,
	AdminGetAnnouncementsAPI,
	AdminUpdateAnnouncementAPI,
} from "../../../Endpoints";

const PRESET_OPTIONS = [
	{
		value: "info",
		label: "Info",
		icon: "info",
		backgroundColor: "#F4F8FF",
		borderColor: "#D8E7FF",
		textColor: "#2C5CC5",
		iconColor: "#3B6DDB",
	},
	{
		value: "success",
		label: "Success",
		icon: "success",
		backgroundColor: "#F1FBF5",
		borderColor: "#CDEFD8",
		textColor: "#1E7A46",
		iconColor: "#239B56",
	},
	{
		value: "warning",
		label: "Warning",
		icon: "warning",
		backgroundColor: "#FFF8EC",
		borderColor: "#F8DEC0",
		textColor: "#B76610",
		iconColor: "#DE9301",
	},
	{
		value: "custom",
		label: "Custom",
		icon: "megaphone",
		backgroundColor: "#F8F8F8",
		borderColor: "#D9D9D9",
		textColor: "#3D3D3D",
		iconColor: "#3D3D3D",
	},
];

const ICON_OPTIONS = [
	{ value: "info", label: "Info" },
	{ value: "success", label: "Success" },
	{ value: "warning", label: "Warning" },
	{ value: "megaphone", label: "Megaphone" },
	{ value: "celebration", label: "Celebration" },
	{ value: "calendar", label: "Calendar" },
];

const initialForm = {
	message: "",
	audiences: ["user"],
	preset: "info",
	icon: "info",
	backgroundColor: "#F4F8FF",
	borderColor: "#D8E7FF",
	textColor: "#2C5CC5",
	iconColor: "#3B6DDB",
	isActive: true,
	startsAt: "",
	endsAt: "",
	priority: 0,
};

const getIcon = (iconName) => {
	switch (iconName) {
		case "success":
			return FaCircleCheck;
		case "warning":
			return FaTriangleExclamation;
		case "calendar":
			return FaCalendarDays;
		case "celebration":
			return FaWandMagicSparkles;
		case "megaphone":
			return FaBullhorn;
		case "info":
		default:
			return FaCircleInfo;
	}
};

const formatDateTimeLocal = (value) => {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n) => `${n}`.padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const AnnouncementChip = ({ announcement }) => {
	const IconComponent = getIcon(announcement.icon);

	return (
		<HStack
			spacing={2}
			bg={announcement.backgroundColor}
			border="1px solid"
			borderColor={announcement.borderColor}
			borderRadius="full"
			px={3}
			py={1.5}
			display="inline-flex"
			maxW="100%"
		>
			<HStack
				w="18px"
				h="18px"
				borderRadius="full"
				bg="whiteAlpha.800"
				justify="center"
				align="center"
				flexShrink={0}
			>
				<Icon as={IconComponent} color={announcement.iconColor} boxSize={3} />
			</HStack>
			<Text color={announcement.textColor} fontSize="sm" fontWeight="500" whiteSpace="nowrap">
				{announcement.message}
			</Text>
		</HStack>
	);
};

const AnnouncementsAdmin = () => {
	const toast = useToast();
	const { handleTokenExpired } = useContext(GlobalContext);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [announcements, setAnnouncements] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editingAnnouncement, setEditingAnnouncement] = useState(null);
	const [search, setSearch] = useState("");
	const [audienceFilter, setAudienceFilter] = useState("all");
	const [form, setForm] = useState(initialForm);

	const authHeaders = useMemo(() => {
		const token = localStorage.getItem("authToken");
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
	}, []);

	const fetchAnnouncements = useCallback(async () => {
		setLoading(true);
		try {
			const response = await axios.get(AdminGetAnnouncementsAPI, { headers: authHeaders });
			setAnnouncements(response.data?.data || []);
		} catch (error) {
			console.error("Error fetching announcements:", error);
			toast({
				title: "Unable to load announcements",
				description: error.response?.data?.error || error.message,
				status: "error",
				duration: 4000,
				isClosable: true,
			});

			if (error.response?.status === 401) {
				handleTokenExpired();
			}
		} finally {
			setLoading(false);
		}
	}, [authHeaders, handleTokenExpired, toast]);

	useEffect(() => {
		fetchAnnouncements();
	}, [fetchAnnouncements]);

	const displayedAnnouncements = useMemo(() => {
		const query = search.trim().toLowerCase();

		return announcements.filter((announcement) => {
			const matchesAudience =
				audienceFilter === "all" ? true : (announcement.audiences || []).includes(audienceFilter);
			const matchesSearch = query
				? announcement.message?.toLowerCase().includes(query)
				: true;
			return matchesAudience && matchesSearch;
		});
	}, [announcements, audienceFilter, search]);

	const activeCount = announcements.filter((item) => item.isActive).length;
	const customCount = announcements.filter((item) => item.preset === "custom").length;
	const usersCount = announcements.filter((item) => item.audiences?.includes("user")).length;

	const applyPresetToForm = (presetValue) => {
		const preset = PRESET_OPTIONS.find((option) => option.value === presetValue);
		if (!preset) return;

		setForm((prev) => ({
			...prev,
			preset: presetValue,
			icon: preset.icon,
			backgroundColor: preset.backgroundColor,
			borderColor: preset.borderColor,
			textColor: preset.textColor,
			iconColor: preset.iconColor,
		}));
	};

	const openCreateModal = () => {
		setEditingAnnouncement(null);
		setForm(initialForm);
		onOpen();
	};

	const openEditModal = (announcement) => {
		setEditingAnnouncement(announcement);
		setForm({
			message: announcement.message || "",
			audiences: announcement.audiences || ["user"],
			preset: announcement.preset || "info",
			icon: announcement.icon || "info",
			backgroundColor: announcement.backgroundColor || "#F4F8FF",
			borderColor: announcement.borderColor || "#D8E7FF",
			textColor: announcement.textColor || "#2C5CC5",
			iconColor: announcement.iconColor || "#3B6DDB",
			isActive: Boolean(announcement.isActive),
			startsAt: formatDateTimeLocal(announcement.startsAt),
			endsAt: formatDateTimeLocal(announcement.endsAt),
			priority: announcement.priority ?? 0,
		});
		onOpen();
	};

	const closeModal = () => {
		setEditingAnnouncement(null);
		setForm(initialForm);
		onClose();
	};

	const handleSave = async () => {
		if (!form.message.trim()) {
			toast({
				title: "Message required",
				description: "Please enter a short announcement message.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (!form.audiences.length) {
			toast({
				title: "Audience required",
				description: "Select at least one audience.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const payload = {
			message: form.message.trim(),
			audiences: form.audiences,
			preset: form.preset,
			icon: form.icon,
			backgroundColor: form.backgroundColor,
			borderColor: form.borderColor,
			textColor: form.textColor,
			iconColor: form.iconColor,
			isActive: form.isActive,
			startsAt: form.startsAt || undefined,
			endsAt: form.endsAt || undefined,
			priority: Number(form.priority) || 0,
		};

		setSaving(true);
		try {
			if (editingAnnouncement?.id || editingAnnouncement?._id) {
				await axios.put(AdminUpdateAnnouncementAPI(editingAnnouncement.id || editingAnnouncement._id), payload, {
					headers: authHeaders,
				});
				toast({ title: "Announcement updated", status: "success", duration: 3000, isClosable: true });
			} else {
				await axios.post(AdminCreateAnnouncementAPI, payload, { headers: authHeaders });
				toast({ title: "Announcement created", status: "success", duration: 3000, isClosable: true });
			}
			closeModal();
			fetchAnnouncements();
		} catch (error) {
			console.error("Error saving announcement:", error);
			toast({
				title: "Save failed",
				description: error.response?.data?.error || error.message,
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		} finally {
			setSaving(false);
		}
	};

	const handleStatusToggle = async (announcement, nextState) => {
		try {
			await axios.patch(
				AdminChangeAnnouncementStatusAPI(announcement.id || announcement._id),
				{ isActive: nextState },
				{ headers: authHeaders }
			);
			toast({
				title: nextState ? "Announcement activated" : "Announcement deactivated",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			fetchAnnouncements();
		} catch (error) {
			console.error("Error updating announcement status:", error);
			toast({
				title: "Status update failed",
				description: error.response?.data?.error || error.message,
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		}
	};

	const handleDelete = async (announcement) => {
		try {
			await axios.delete(AdminDeleteAnnouncementAPI(announcement.id || announcement._id), { headers: authHeaders });
			toast({
				title: "Announcement deleted",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			fetchAnnouncements();
		} catch (error) {
			console.error("Error deleting announcement:", error);
			toast({
				title: "Delete failed",
				description: error.response?.data?.error || error.message,
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		}
	};

	return (
		<Flex direction="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem" w="100%">
					<Spinner size="xl" />
				</Flex>
			) : (
				<>
					<SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px" mb="30px">
						<Card p="20px" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
							<Text fontSize="md" opacity={0.85}>Total Announcements</Text>
							<Text fontSize="3xl" fontWeight="bold">{announcements.length}</Text>
							<Text fontSize="sm" opacity={0.75}>All saved ticker messages</Text>
						</Card>
						<Card p="20px" bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" color="white">
							<Text fontSize="md" opacity={0.85}>Active</Text>
							<Text fontSize="3xl" fontWeight="bold">{activeCount}</Text>
							<Text fontSize="sm" opacity={0.75}>Visible to at least one app</Text>
						</Card>
						<Card p="20px" bg="linear-gradient(135deg, #f6d365 0%, #fda085 100%)" color="white">
							<Text fontSize="md" opacity={0.85}>Users Targeted</Text>
							<Text fontSize="3xl" fontWeight="bold">{usersCount}</Text>
							<Text fontSize="sm" opacity={0.75}>Announcements reaching users</Text>
						</Card>
						<Card p="20px" bg="linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" color="white">
							<Text fontSize="md" opacity={0.85}>Custom Styled</Text>
							<Text fontSize="3xl" fontWeight="bold">{customCount}</Text>
							<Text fontSize="sm" opacity={0.75}>Non-preset announcements</Text>
						</Card>
					</SimpleGrid>

					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
								<VStack align="start" spacing={1}>
									<Text fontSize="2xl" fontWeight="bold" color="gray.800">Announcement Strips</Text>
									<Text fontSize="md" color="gray.500">
										Create short ticker announcements for users, agents, or both apps.
									</Text>
								</VStack>
								<Button leftIcon={<FaPlus />} colorScheme="orange" onClick={openCreateModal}>
									New Announcement
								</Button>
							</Flex>
						</CardHeader>

						<CardBody>
							<HStack spacing={3} mb={6} flexWrap="wrap">
								<Input
									placeholder="Search announcement text"
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									maxW="320px"
								/>
								<Select maxW="200px" value={audienceFilter} onChange={(event) => setAudienceFilter(event.target.value)}>
									<option value="all">All audiences</option>
									<option value="user">Users only</option>
									<option value="agent">Agents only</option>
								</Select>
							</HStack>

							<VStack spacing={4} align="stretch">
								{displayedAnnouncements.map((announcement) => (
									<Box
										key={announcement.id || announcement._id}
										border="1px solid"
										borderColor="gray.200"
										borderRadius="2xl"
										p={5}
										bg="gray.50"
									>
										<Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={4}>
											<GridItem>
												<VStack align="start" spacing={3}>
													<AnnouncementChip announcement={announcement} />
													<HStack spacing={2} flexWrap="wrap">
														<Badge colorScheme={announcement.isActive ? "green" : "gray"}>
															{announcement.isActive ? "Active" : "Inactive"}
														</Badge>
														<Badge colorScheme="purple">{announcement.preset}</Badge>
														{(announcement.audiences || []).map((audience) => (
															<Badge key={audience} colorScheme="blue">{audience}</Badge>
														))}
														<Badge colorScheme="orange">Priority {announcement.priority || 0}</Badge>
													</HStack>
													<Text fontSize="sm" color="gray.500">
														Starts: {announcement.startsAt ? new Date(announcement.startsAt).toLocaleString() : "Immediately"} {" • "}
														Ends: {announcement.endsAt ? new Date(announcement.endsAt).toLocaleString() : "No end date"}
													</Text>
												</VStack>
											</GridItem>
											<GridItem>
												<VStack align="stretch" spacing={3}>
													<Switch
														isChecked={Boolean(announcement.isActive)}
														onChange={(event) => handleStatusToggle(announcement, event.target.checked)}
													>
														{announcement.isActive ? "Active" : "Inactive"}
													</Switch>
													<HStack spacing={3} flexWrap="wrap">
														<Button
															size="sm"
															variant="outline"
															leftIcon={<FaPenToSquare />}
															onClick={() => openEditModal(announcement)}
														>
															Edit
														</Button>
														<Button
															size="sm"
															variant="outline"
															colorScheme="red"
															leftIcon={<FaTrash />}
															onClick={() => handleDelete(announcement)}
														>
															Delete
														</Button>
													</HStack>
												</VStack>
											</GridItem>
										</Grid>
									</Box>
								))}

								{!displayedAnnouncements.length ? (
									<Box p={10} textAlign="center" border="1px dashed" borderColor="gray.300" borderRadius="2xl">
										<Text fontSize="lg" fontWeight="600" mb={2}>No announcements yet</Text>
										<Text color="gray.500">Create your first strip announcement to start targeting users or agents.</Text>
									</Box>
								) : null}
							</VStack>
						</CardBody>
					</Card>
				</>
			)}

			<Modal isOpen={isOpen} onClose={closeModal} size="3xl">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>{editingAnnouncement ? "Edit Announcement" : "Create Announcement"}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={5} align="stretch">
							<Box p={4} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.200">
								<Text fontSize="sm" color="gray.500" mb={3}>Live preview</Text>
								<AnnouncementChip announcement={form} />
							</Box>

							<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
								<GridItem colSpan={{ base: 1, md: 2 }}>
									<Text fontSize="sm" fontWeight="600" mb={2}>Announcement text</Text>
									<Textarea
										value={form.message}
										onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
										placeholder="Welcome to Africartz."
										maxLength={160}
									/>
									<Text fontSize="xs" color="gray.500" mt={1}>{form.message.length}/160</Text>
								</GridItem>

								<GridItem>
									<Text fontSize="sm" fontWeight="600" mb={2}>Preset</Text>
									<Select
										value={form.preset}
										onChange={(event) => applyPresetToForm(event.target.value)}
									>
										{PRESET_OPTIONS.map((preset) => (
											<option key={preset.value} value={preset.value}>{preset.label}</option>
										))}
									</Select>
								</GridItem>

								<GridItem>
									<Text fontSize="sm" fontWeight="600" mb={2}>Priority</Text>
									<Input
										type="number"
										value={form.priority}
										onChange={(event) => setForm((prev) => ({ ...prev, priority: Number(event.target.value) }))}
									/>
								</GridItem>

								<GridItem colSpan={{ base: 1, md: 2 }}>
									<Text fontSize="sm" fontWeight="600" mb={2}>Audience</Text>
									<CheckboxGroup
										colorScheme="orange"
										value={form.audiences}
										onChange={(values) => setForm((prev) => ({ ...prev, audiences: values }))}
									>
										<HStack spacing={5}>
											<Checkbox value="user">Users</Checkbox>
											<Checkbox value="agent">Agents</Checkbox>
										</HStack>
									</CheckboxGroup>
								</GridItem>

								<GridItem>
									<Text fontSize="sm" fontWeight="600" mb={2}>Starts at</Text>
									<Input
										type="datetime-local"
										value={form.startsAt}
										onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
									/>
								</GridItem>

								<GridItem>
									<Text fontSize="sm" fontWeight="600" mb={2}>Ends at</Text>
									<Input
										type="datetime-local"
										value={form.endsAt}
										onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
									/>
								</GridItem>

								<GridItem colSpan={{ base: 1, md: 2 }}>
									<Switch
										isChecked={form.isActive}
										onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
									>
										Active immediately
									</Switch>
								</GridItem>

								{form.preset === "custom" ? (
									<>
										<GridItem>
											<Text fontSize="sm" fontWeight="600" mb={2}>Icon</Text>
											<Select
												value={form.icon}
												onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
											>
												{ICON_OPTIONS.map((option) => (
													<option key={option.value} value={option.value}>{option.label}</option>
												))}
											</Select>
										</GridItem>
										<GridItem />
										<GridItem>
											<Text fontSize="sm" fontWeight="600" mb={2}>Background color</Text>
											<Input
												type="color"
												value={form.backgroundColor}
												onChange={(event) => setForm((prev) => ({ ...prev, backgroundColor: event.target.value }))}
												p={1}
												h="44px"
											/>
										</GridItem>
										<GridItem>
											<Text fontSize="sm" fontWeight="600" mb={2}>Border color</Text>
											<Input
												type="color"
												value={form.borderColor}
												onChange={(event) => setForm((prev) => ({ ...prev, borderColor: event.target.value }))}
												p={1}
												h="44px"
											/>
										</GridItem>
										<GridItem>
											<Text fontSize="sm" fontWeight="600" mb={2}>Text color</Text>
											<Input
												type="color"
												value={form.textColor}
												onChange={(event) => setForm((prev) => ({ ...prev, textColor: event.target.value }))}
												p={1}
												h="44px"
											/>
										</GridItem>
										<GridItem>
											<Text fontSize="sm" fontWeight="600" mb={2}>Icon color</Text>
											<Input
												type="color"
												value={form.iconColor}
												onChange={(event) => setForm((prev) => ({ ...prev, iconColor: event.target.value }))}
												p={1}
												h="44px"
											/>
										</GridItem>
									</>
								) : null}
							</Grid>
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={closeModal}>Cancel</Button>
						<Button colorScheme="orange" onClick={handleSave} isLoading={saving}>
							{editingAnnouncement ? "Save changes" : "Create announcement"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default AnnouncementsAdmin;
