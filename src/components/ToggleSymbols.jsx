import { Flex, FormControl, FormLabel, Switch } from "@chakra-ui/react";
import React from "react";

const ToggleSymbols = ({ label, value, handleChange }) => {
	return (
		<Flex flexDir={"column"} mb="25px">
			<FormControl display="flex" alignItems="center" mb={"5px"}>
				<Switch id={"switch-label-" + label} colorScheme={"orange"} />
				<FormLabel htmlFor={"switch-label-" + label} mb="0" ml={"9px"}>
					{label}
				</FormLabel>
			</FormControl>
		</Flex>
	);
};

export default ToggleSymbols;
