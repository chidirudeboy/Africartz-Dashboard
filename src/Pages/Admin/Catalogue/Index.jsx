import {
	Box,
	Flex,
	Heading,
	Text,
	SimpleGrid,
	Tag,
	Divider,
	Spinner,
	useToast,
	Button,
	Stack,
	Input,
	FormControl,
	FormLabel,
} from "@chakra-ui/react";
import { CopyIcon, SearchIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import { AdminGetCatalogueAPI } from "../../../Endpoints";

const Catalogue = () => {
	const [apartments, setApartments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [filters, setFilters] = useState({ bedrooms: "", city: "" });
	const [hasSearched, setHasSearched] = useState(false);
	const toast = useToast();

	const fetchCatalogue = async () => {
		setLoading(true);
		try {
			const authToken = localStorage.getItem("authToken");
			if (!authToken) {
				throw new Error("Authentication required");
			}

			const response = await axios.get(AdminGetCatalogueAPI, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				params: {
					bedrooms: filters.bedrooms || undefined,
					city: filters.city || undefined,
				},
			});

			const data = response.data?.apartments || [];
			setApartments(
				data.map((apt) => ({
					id: apt._id,
					name: apt.apartmentName,
					city: apt.city,
					state: apt.state,
					price: apt.defaultStayFee,
					link: apt.webLink,
					agent: apt.agentId ? `${apt.agentId.firstName} ${apt.agentId.lastName}` : "N/A",
				}))
			);
		} catch (error) {
			console.error("Failed to fetch catalogue:", error);
			toast({
				title: "Unable to load catalogue",
				description: error.response?.data?.message || error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCopyLink = async (link) => {
		if (!link) {
			toast({
				title: "Link not available",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		try {
			await navigator.clipboard.writeText(link);
			toast({
				title: "Link copied",
				description: "Apartment link has been copied to clipboard",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.error("Copy failed:", error);
			toast({
				title: "Copy failed",
				description: "Please copy manually",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const handleCopyAllLinks = async () => {
		const linksWithInfo = apartments
			.filter((apt) => apt.link)
			.map((apt) => {
				// Format: Apartment Name - Link
				return `${apt.name || 'Apartment'} - ${apt.link}`;
			});
		
		if (linksWithInfo.length === 0) {
			toast({
				title: "No links available",
				status: "warning",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		try {
			// Join with double newline for better spacing when copying
			const formattedLinks = linksWithInfo.join("\n\n");
			await navigator.clipboard.writeText(formattedLinks);
			toast({
				title: "Links copied",
				description: `${linksWithInfo.length} links copied to clipboard`,
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.error("Copy all links failed:", error);
			toast({
				title: "Copy failed",
				description: "Unable to copy all links",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	return (
		<Box>
			<Flex direction="column" gap="4" mb="6" pt="20">
				<Flex justify="space-between" align="center">
					<Heading size="lg">Approved Catalogue</Heading>
					<Tag colorScheme="green" borderRadius="full">
						{apartments.length} apartments
					</Tag>
				</Flex>
				<Flex gap="4" flexWrap="wrap" align="flex-end">
					<FormControl maxW="160px">
						<FormLabel fontSize="sm">Bedrooms</FormLabel>
						<Input
							type="number"
							value={filters.bedrooms}
							onChange={(e) => setFilters((prev) => ({ ...prev, bedrooms: e.target.value }))}
							placeholder="e.g., 2"
						/>
					</FormControl>
				<FormControl maxW="260px">
					<FormLabel fontSize="sm">City / State</FormLabel>
					<Input
						value={filters.city}
						onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
						placeholder="City or state"
					/>
				</FormControl>
					<Button
						leftIcon={<SearchIcon />}
						colorScheme="orange"
						onClick={() => {
							if (!filters.city) {
								toast({
									title: "City is required",
									description: "Specify a city to search the catalogue.",
									status: "warning",
									duration: 3000,
									isClosable: true,
								});
								return;
							}
							setHasSearched(true);
							fetchCatalogue();
						}}
					>
						Search
					</Button>
					<Button
						variant="ghost"
						colorScheme="gray"
						onClick={() => {
							setFilters({ bedrooms: "", city: "" });
							setHasSearched(false);
							setApartments([]);
						}}
					>
						Clear filters
					</Button>
					<Button
						variant="outline"
						leftIcon={<CopyIcon />}
						onClick={handleCopyAllLinks}
					>
						Copy all links
					</Button>
				</Flex>
			</Flex>
			<Divider mb="6" />
			{loading ? (
				<Flex justify="center" py="40">
					<Spinner size="xl" />
				</Flex>
			) : hasSearched ? (
				apartments.length === 0 ? (
					<Text>No links found for the selected city.</Text>
				) : (
					<Stack spacing="3">
						{apartments.map((apartment) => (
							<Box key={apartment.id} borderWidth="1px" borderRadius="lg" p="4" shadow="sm">
								<Flex direction={{ base: "column", md: "row" }} align="center" gap="3">
									<Text fontSize="sm" fontWeight="medium" color="blue.600" noOfLines={1}>
										{apartment.link || "Link not available"}
									</Text>
									<Button
										size="sm"
										variant="ghost"
										leftIcon={<CopyIcon />}
										onClick={() => handleCopyLink(apartment.link)}
									>
										Copy link
									</Button>
								</Flex>
							</Box>
						))}
					</Stack>
				)
			) : (
				<Text fontSize="sm" color="gray.500">
					Start by searching for a city to show catalogue links.
				</Text>
			)}
		</Box>
	);
};

export default Catalogue;

