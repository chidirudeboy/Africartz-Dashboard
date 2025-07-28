import { Button, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import IconBox from "../../components/Icons/IconBox";

const SideBarLink = ({ text, icon, route }) => {
	const activeBg = useColorModeValue("white", "gray.700");
	const inactiveBg = useColorModeValue("white", "gray.700");
	const activeColor = useColorModeValue("#de9301", "white");
	const inactiveColor = useColorModeValue("gray.400", "gray.400");

	let location = useLocation();
	const active = location.pathname === route;

	return (
		<NavLink to={route}>
			<Button
				boxSize="initial"
				justifyContent="flex-start"
				alignItems="center"
				bg={active ? activeBg : "transparent"}
				py="2px"
				borderRadius="15px"
				w="100%"
				mb={{ xl: "0px" }}
				mx={{ xl: "auto" }}
				ps={{ sm: "10px", xl: "8px" }}
				_active={{
					bg: "inherit",
					transform: "none",
					borderColor: "transparent",
				}}
				_focus={{ boxShadow: "none" }}
				_hover={{ bg: inactiveBg }}
			>
				<Flex>
					<IconBox
						color={active ? activeColor : inactiveColor}
						h="30px"
						w="30px"
						me="12px"
					>
						{icon}
					</IconBox>
					<Text
						color={active ? activeColor : inactiveColor}
						my="auto"
						fontSize="sm"
						_hover={{ color: "#de9301" }}
					>
						{text}
					</Text>
				</Flex>
			</Button>
		</NavLink>
	);
};

export default SideBarLink;