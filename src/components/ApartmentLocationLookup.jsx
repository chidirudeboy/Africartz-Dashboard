import {
	Badge,
	Box,
	Button,
	HStack,
	Icon,
	Spinner,
	Text,
	VStack,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useMemo, useState } from "react";
import { FaMapMarkerAlt, FaSearchLocation } from "react-icons/fa";
import { PlacesAutocompleteAPI, PlaceDetailsAPI } from "../Endpoints";

const ApartmentLocationLookup = ({ apartment, onChange, toast }) => {
	const [isSearching, setIsSearching] = useState(false);
	const [resolvingPlaceId, setResolvingPlaceId] = useState(null);
	const [predictions, setPredictions] = useState([]);

	const addressQuery = useMemo(
		() => [apartment?.address, apartment?.city, apartment?.state, "Nigeria"].filter(Boolean).join(", "),
		[apartment?.address, apartment?.city, apartment?.state]
	);

	const findAddress = async () => {
		if (addressQuery.replace(/, Nigeria$/, "").trim().length < 3) {
			toast({
				title: "Enter an address first",
				description: "Add the apartment address, city and state before asking Google to locate it.",
				status: "info",
				duration: 4000,
				isClosable: true,
			});
			return;
		}

		setIsSearching(true);
		setPredictions([]);
		try {
			const response = await axios.get(PlacesAutocompleteAPI, { params: { input: addressQuery } });
			const results = response.data?.data?.predictions || [];
			setPredictions(results);
			if (results.length === 0) {
				toast({ title: "Address not found", description: "Try adding a street name, landmark, city or state.", status: "warning", duration: 4000, isClosable: true });
			}
		} catch (error) {
			toast({
				title: "Could not search Google Maps",
				description: error.response?.data?.message || "Please try again in a moment.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setIsSearching(false);
		}
	};

	const choosePlace = async (prediction) => {
		setResolvingPlaceId(prediction.place_id);
		try {
			const response = await axios.get(PlaceDetailsAPI(prediction.place_id));
			const place = response.data?.data;
			const latitude = place?.geometry?.location?.lat;
			const longitude = place?.geometry?.location?.lng;

			if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
				throw new Error("Google did not return coordinates for this address");
			}

			onChange({
				...apartment,
				location: {
					...(apartment.location || {}),
					placeId: place.place_id || prediction.place_id,
					formattedAddress: place.formatted_address || prediction.description,
					lat: latitude,
					lng: longitude,
				},
			});
			setPredictions([]);
			toast({ title: "Coordinates found", description: "Review the map result, then save the apartment.", status: "success", duration: 3500, isClosable: true });
		} catch (error) {
			toast({
				title: "Could not load this location",
				description: error.response?.data?.message || error.message || "Please choose another result.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} finally {
			setResolvingPlaceId(null);
		}
	};

	return (
		<Box mb={4}>
			<HStack align="start" spacing={3} flexWrap="wrap">
				<Box flex="1" minW={{ base: "100%", md: "260px" }} p={3} borderRadius="md" bg="gray.50" border="1px solid" borderColor="gray.200">
					<Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Address sent to Google</Text>
					<Text fontSize="sm" mt={1}>{addressQuery || "No address entered"}</Text>
				</Box>
				<Button leftIcon={<FaSearchLocation />} colorScheme="orange" onClick={findAddress} isLoading={isSearching} loadingText="Searching">
					Find coordinates
				</Button>
			</HStack>

			{predictions.length > 0 && (
				<VStack mt={3} spacing={2} align="stretch" border="1px solid" borderColor="gray.200" borderRadius="lg" p={2} bg="white" boxShadow="sm">
					<Text px={2} pt={1} fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Choose the correct address</Text>
					{predictions.map((prediction) => (
						<Button key={prediction.place_id} h="auto" py={3} px={3} variant="ghost" justifyContent="flex-start" textAlign="left" whiteSpace="normal" onClick={() => choosePlace(prediction)} isDisabled={Boolean(resolvingPlaceId)}>
							<HStack align="start" spacing={3} w="100%">
								{resolvingPlaceId === prediction.place_id ? <Spinner size="sm" mt={1} /> : <Icon as={FaMapMarkerAlt} color="#de9301" mt={1} />}
								<Box flex="1">
									<Text fontSize="sm" fontWeight="semibold">{prediction.structured_formatting?.main_text || prediction.description}</Text>
									{prediction.structured_formatting?.secondary_text && <Text fontSize="xs" color="gray.500">{prediction.structured_formatting.secondary_text}</Text>}
								</Box>
								<Badge colorScheme="yellow">Select</Badge>
							</HStack>
						</Button>
					))}
				</VStack>
			)}
		</Box>
	);
};

export default ApartmentLocationLookup;
