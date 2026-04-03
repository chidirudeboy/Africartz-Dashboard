import { Button, Flex, Text, useColorModeValue, Tooltip, Box } from "@chakra-ui/react";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import IconBox from "../../components/Icons/IconBox";

const SideBarLink = ({ text, icon, route, isCollapsed }) => {
	const activeBg = useColorModeValue("linear-gradient(135deg, #de9301 0%, #f5a623 100%)", "gray.600");
	const inactiveBg = useColorModeValue("transparent", "transparent");
	const activeColor = useColorModeValue("white", "white");
	const inactiveColor = useColorModeValue("gray.600", "gray.400");
	const hoverBg = useColorModeValue("gray.50", "gray.700");

	let location = useLocation();
	const active = location.pathname === route;

	const linkContent = (
		<NavLink to={route} style={{ width: "100%" }}>
			<Button
				boxSize="initial"
				justifyContent={isCollapsed ? "center" : "flex-start"}
				alignItems="center"
				bg={active ? activeBg : inactiveBg}
				py="12px"
				px={isCollapsed ? "0" : "16px"}
				borderRadius="12px"
				w="100%"
				h={isCollapsed ? "50px" : "auto"}
				minH="50px"
				mb={{ xl: "0px" }}
				mx={{ xl: "auto" }}
				_active={{
					bg: "inherit",
					transform: "none",
					borderColor: "transparent",
				}}
				_focus={{ boxShadow: "none" }}
				_hover={{
					bg: active ? activeBg : hoverBg,
					transform: "translateY(-1px)",
					boxShadow: active ? "lg" : "md"
				}}
				transition="all 0.2s ease"
				position="relative"
				overflow="hidden"
			>
				{/* Subtle gradient overlay for active state */}
				{active && (
					<Box
						position="absolute"
						top="0"
						left="0"
						right="0"
						bottom="0"
						bg="linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
						borderRadius="12px"
					/>
				)}

				<Flex align="center" justify={isCollapsed ? "center" : "flex-start"} w="100%" position="relative">
					<IconBox
						color={active ? activeColor : inactiveColor}
						h="32px"
						w="32px"
						me={isCollapsed ? "0" : "12px"}
						borderRadius="8px"
						bg={active ? "rgba(255,255,255,0.15)" : "transparent"}
						transition="all 0.2s ease"
					>
						{icon}
					</IconBox>
					{!isCollapsed && (
						<Text
							color={active ? activeColor : inactiveColor}
							my="auto"
							fontSize="sm"
							fontWeight={active ? "600" : "500"}
							transition="all 0.2s ease"
							_groupHover={{ color: active ? activeColor : "#de9301" }}
						>
							{text}
						</Text>
					)}
				</Flex>
			</Button>
		</NavLink>
	);

	// Wrap with tooltip when collapsed
	if (isCollapsed) {
		return (
			<Tooltip
				label={text}
				placement="right"
				hasArrow
				bg="gray.800"
				color="white"
				fontSize="sm"
				fontWeight="medium"
				px="12px"
				py="8px"
				borderRadius="8px"
				openDelay={300}
			>
				{linkContent}
			</Tooltip>
		);
	}

	return linkContent;
};

export default SideBarLink;