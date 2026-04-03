import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
} from "@chakra-ui/react";
import axios from "axios";
import {
	FaNewspaper,
	FaPlus,
	FaPenToSquare,
	FaGlobe,
	FaFileLines,
	FaEye,
} from "react-icons/fa6";
import Card from "../../../components/Card/Card";
import CardBody from "../../../components/Card/CardBody";
import CardHeader from "../../../components/Card/CardHeader";
import GlobalContext from "../../../Context";
import {
	AdminChangeBlogStatusAPI,
	AdminCreateBlogAPI,
	AdminDeleteBlogAPI,
	AdminGetBlogsAPI,
	AdminUpdateBlogAPI,
} from "../../../Endpoints";

const initialForm = {
	title: "",
	excerpt: "",
	content: "",
	coverImage: "",
	tags: "",
	status: "draft",
	isFeatured: false,
};

const statusColor = {
	draft: "orange",
	published: "green",
};

const normalizeExcerpt = (excerpt, content) => {
	const rawExcerpt = (excerpt?.trim() || content.trim().slice(0, 180)).replace(/\s+/g, " ").trim();
	return rawExcerpt.length > 320 ? `${rawExcerpt.slice(0, 317).trim()}...` : rawExcerpt;
};

const BlogsAdmin = () => {
	const toast = useToast();
	const { handleTokenExpired } = useContext(GlobalContext);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editingPost, setEditingPost] = useState(null);
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");
	const [form, setForm] = useState(initialForm);

	const authHeaders = useMemo(() => {
		const token = localStorage.getItem("authToken");
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
	}, []);

	const fetchPosts = useCallback(async () => {
		setLoading(true);
		try {
			const response = await axios.get(AdminGetBlogsAPI, { headers: authHeaders });
			setPosts(response.data?.data || []);
		} catch (error) {
			console.error("Error fetching blog posts:", error);
			toast({
				title: "Unable to load blog posts",
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
		fetchPosts();
	}, [fetchPosts]);

	const displayedPosts = useMemo(() => {
		const normalizedQuery = search.trim().toLowerCase();

		return posts.filter((post) => {
			const matchesFilter = filter === "all" ? true : post.status === filter;
			const matchesSearch = normalizedQuery
				? [post.title, post.excerpt, post.authorName, ...(post.tags || [])]
						.filter(Boolean)
						.some((value) => value.toLowerCase().includes(normalizedQuery))
				: true;

			return matchesFilter && matchesSearch;
		});
	}, [filter, posts, search]);

	const publishedCount = posts.filter((post) => post.status === "published").length;
	const draftCount = posts.filter((post) => post.status === "draft").length;
	const featuredCount = posts.filter((post) => post.isFeatured).length;
	const totalViews = posts.reduce((sum, post) => sum + (post.viewCount || 0), 0);

	const openCreateModal = () => {
		setEditingPost(null);
		setForm(initialForm);
		onOpen();
	};

	const openEditModal = (post) => {
		setEditingPost(post);
		setForm({
			title: post.title || "",
			excerpt: post.excerpt || "",
			content: post.content || "",
			coverImage: post.coverImage || "",
			tags: (post.tags || []).join(", "),
			status: post.status || "draft",
			isFeatured: Boolean(post.isFeatured),
		});
		onOpen();
	};

	const closeModal = () => {
		setEditingPost(null);
		setForm(initialForm);
		onClose();
	};

	const handleSave = async () => {
		if (!form.title.trim() || !form.content.trim()) {
			toast({
				title: "Missing content",
				description: "Title and content are required.",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const payload = {
			title: form.title.trim(),
			excerpt: normalizeExcerpt(form.excerpt, form.content),
			content: form.content.trim(),
			coverImage: form.coverImage.trim(),
			tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
			status: form.status,
			isFeatured: form.isFeatured,
		};

		setSaving(true);
		try {
			if (editingPost?._id || editingPost?.id) {
				await axios.put(AdminUpdateBlogAPI(editingPost._id || editingPost.id), payload, { headers: authHeaders });
				toast({ title: "Blog post updated", status: "success", duration: 3000, isClosable: true });
			} else {
				await axios.post(AdminCreateBlogAPI, payload, { headers: authHeaders });
				toast({ title: "Blog post created", status: "success", duration: 3000, isClosable: true });
			}
			closeModal();
			fetchPosts();
		} catch (error) {
			console.error("Error saving blog post:", error);
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

	const handleStatusChange = async (post, status) => {
		try {
			await axios.patch(
				AdminChangeBlogStatusAPI(post._id || post.id),
				{ status },
				{ headers: authHeaders }
			);
			toast({
				title: status === "published" ? "Post published" : "Moved to draft",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			fetchPosts();
		} catch (error) {
			console.error("Error changing post status:", error);
			toast({
				title: "Status update failed",
				description: error.response?.data?.error || error.message,
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		}
	};

	const handleDelete = async (post) => {
		const confirmed = window.confirm(`Delete "${post.title}"? This cannot be undone.`);
		if (!confirmed) return;

		try {
			await axios.delete(AdminDeleteBlogAPI(post._id || post.id), { headers: authHeaders });
			toast({ title: "Blog post deleted", status: "success", duration: 3000, isClosable: true });
			fetchPosts();
		} catch (error) {
			console.error("Error deleting blog post:", error);
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
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<Flex justify="center" align="center" h="30rem">
					<Spinner size="xl" />
				</Flex>
			) : (
				<Fragment>
					<SimpleGrid columns={{ sm: 1, md: 2, xl: 5 }} spacing="24px" mb="30px">
						<Card p="20px" bg="linear-gradient(135deg, #f6ad55 0%, #dd6b20 100%)" color="white">
							<Text fontSize="sm" opacity={0.85}>Total Posts</Text>
							<Text fontSize="2xl" fontWeight="bold">{posts.length}</Text>
						</Card>
						<Card p="20px" bg="linear-gradient(135deg, #48bb78 0%, #2f855a 100%)" color="white">
							<Text fontSize="sm" opacity={0.85}>Published</Text>
							<Text fontSize="2xl" fontWeight="bold">{publishedCount}</Text>
						</Card>
						<Card p="20px" bg="linear-gradient(135deg, #ed8936 0%, #c05621 100%)" color="white">
							<Text fontSize="sm" opacity={0.85}>Drafts</Text>
							<Text fontSize="2xl" fontWeight="bold">{draftCount}</Text>
						</Card>
						<Card p="20px" bg="linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%)" color="white">
							<Text fontSize="sm" opacity={0.85}>Featured</Text>
							<Text fontSize="2xl" fontWeight="bold">{featuredCount}</Text>
						</Card>
						<Card p="20px" bg="linear-gradient(135deg, #805ad5 0%, #553c9a 100%)" color="white">
							<Text fontSize="sm" opacity={0.85}>Total Views</Text>
							<Text fontSize="2xl" fontWeight="bold">{totalViews}</Text>
						</Card>
					</SimpleGrid>

					<Card p="24px" w="100%" boxShadow="xl" borderRadius="2xl" bg="white" border="1px solid" borderColor="gray.100">
						<CardHeader pb="20px">
							<Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
								<VStack align="start" spacing={1}>
									<Text fontSize="2xl" fontWeight="bold" color="gray.800">Blog Management</Text>
									<Text fontSize="md" color="gray.500">Create, publish, and manage website blog posts from admin.</Text>
								</VStack>
								<Button leftIcon={<FaPlus />} colorScheme="orange" onClick={openCreateModal}>
									New Post
								</Button>
							</Flex>
						</CardHeader>

						<CardBody>
							<VStack align="stretch" spacing={4}>
								<Flex gap={3} wrap="wrap" justify="space-between">
									<HStack spacing={3} wrap="wrap">
										<Button size="sm" variant={filter === "all" ? "solid" : "outline"} colorScheme="orange" onClick={() => setFilter("all")}>All</Button>
										<Button size="sm" variant={filter === "published" ? "solid" : "outline"} colorScheme="green" onClick={() => setFilter("published")}>Published</Button>
										<Button size="sm" variant={filter === "draft" ? "solid" : "outline"} colorScheme="orange" onClick={() => setFilter("draft")}>Drafts</Button>
									</HStack>
									<Input
										placeholder="Search posts by title, excerpt, author, or tag"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										maxW="420px"
									/>
								</Flex>

								<Text fontSize="sm" color="gray.500">
									Showing {displayedPosts.length} of {posts.length} posts
								</Text>

								<Grid templateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }} gap={6}>
									{displayedPosts.map((post) => (
										<GridItem key={post._id || post.id}>
											<Box border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden" bg={post.status === "published" ? "white" : "orange.50"}>
												{post.coverImage ? (
													<Image src={post.coverImage} alt={post.title} h="180px" w="100%" objectFit="cover" />
												) : (
													<Flex h="180px" bg="gray.100" align="center" justify="center">
														<FaNewspaper size={38} color="#718096" />
													</Flex>
												)}

												<VStack align="stretch" spacing={4} p={5}>
													<Flex justify="space-between" align="start" gap={3}>
														<VStack align="start" spacing={1}>
															<HStack spacing={2} flexWrap="wrap">
																<Badge colorScheme={statusColor[post.status] || "gray"} textTransform="capitalize">{post.status}</Badge>
																{post.isFeatured && <Badge colorScheme="blue">Featured</Badge>}
															</HStack>
															<Text fontWeight="bold" fontSize="lg" color="gray.800">{post.title}</Text>
														</VStack>
														<Button size="xs" leftIcon={<FaPenToSquare />} variant="ghost" onClick={() => openEditModal(post)}>
															Edit
														</Button>
													</Flex>

													<Text fontSize="sm" color="gray.600" noOfLines={3}>{post.excerpt}</Text>

													<HStack spacing={3} wrap="wrap" color="gray.500" fontSize="sm">
														<HStack spacing={1}><FaFileLines /><Text>{Math.max(1, Math.ceil((post.content || "").split(/\s+/).filter(Boolean).length / 200))} min read</Text></HStack>
														<HStack spacing={1}><FaEye /><Text>{post.viewCount || 0} views</Text></HStack>
														<HStack spacing={1}><FaGlobe /><Text>{post.slug}</Text></HStack>
													</HStack>

													{post.tags?.length > 0 && (
														<HStack spacing={2} wrap="wrap">
															{post.tags.map((tag) => (
																<Badge key={`${post._id || post.id}-${tag}`} colorScheme="purple" variant="subtle">#{tag}</Badge>
															))}
														</HStack>
													)}

													<Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
														<Text fontSize="sm" color="gray.500">
															{post.status === "published" && post.publishedAt ? `Published ${new Date(post.publishedAt).toLocaleDateString()}` : `Updated ${new Date(post.updatedAt).toLocaleDateString()}`}
														</Text>
														<HStack spacing={2} wrap="wrap">
															<Button
																size="sm"
																colorScheme={post.status === "published" ? "orange" : "green"}
																variant="outline"
																onClick={() => handleStatusChange(post, post.status === "published" ? "draft" : "published")}
															>
																{post.status === "published" ? "Unpublish" : "Publish"}
															</Button>
															<Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleDelete(post)}>
																Delete
															</Button>
														</HStack>
													</Flex>
												</VStack>
											</Box>
										</GridItem>
									))}
								</Grid>

								{!displayedPosts.length && (
									<Flex border="1px dashed" borderColor="gray.300" borderRadius="xl" py={16} justify="center" align="center">
										<VStack spacing={3}>
											<FaNewspaper size={38} color="#A0AEC0" />
											<Text color="gray.500">No blog posts match this view yet.</Text>
										</VStack>
									</Flex>
								)}
							</VStack>
						</CardBody>
					</Card>
				</Fragment>
			)}

			<Modal isOpen={isOpen} onClose={closeModal} size="4xl" scrollBehavior="inside">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>{editingPost ? "Edit Blog Post" : "Create Blog Post"}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack align="stretch" spacing={4}>
							<Input placeholder="Post title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
							<Input placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))} />
							<Textarea placeholder="Short excerpt (optional)" value={form.excerpt} onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))} rows={3} />
							<Text fontSize="sm" color="gray.500">
								Excerpt preview: {normalizeExcerpt(form.excerpt, form.content).length}/320 characters
							</Text>
							<Textarea placeholder="Write the full blog content here..." value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} rows={12} />
							<Input placeholder="Tags separated by commas" value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} />
							<Flex justify="space-between" align="center" wrap="wrap" gap={4}>
								<HStack spacing={3}>
									<Text fontSize="sm" color="gray.600">Publish immediately</Text>
									<Switch
										isChecked={form.status === "published"}
										onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked ? "published" : "draft" }))}
										colorScheme="green"
									/>
								</HStack>
								<HStack spacing={3}>
									<Text fontSize="sm" color="gray.600">Feature this post</Text>
									<Switch
										isChecked={form.isFeatured}
										onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
										colorScheme="blue"
									/>
								</HStack>
							</Flex>
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={closeModal}>Cancel</Button>
						<Button colorScheme="orange" onClick={handleSave} isLoading={saving}>
							{editingPost ? "Save Changes" : "Create Post"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default BlogsAdmin;
