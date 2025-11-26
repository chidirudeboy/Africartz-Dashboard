/*eslint-disable*/
// chakra imports
import { Box, useColorModeValue, IconButton, Icon, useDisclosure } from "@chakra-ui/react";
import React, { createContext, useContext } from "react";
import { FaBars, FaAngleLeft } from "react-icons/fa";
import SidebarContent from "./SidebarContent";

// Create context for sidebar state
export const SidebarContext = createContext(null);

export const useSidebar = () => {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
};

// FUNCTIONS
function Sidebar(props) {
	// to check for active links and opened collapses
	const mainPanel = React.useRef();
	let variantChange = "0.3s ease";

	const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

	const { logoText, routes, sidebarVariant } = props;

	//  BRAND
	//  Chakra Color Mode
	let sidebarBg = "none";
	let sidebarRadius = "0px";
	let sidebarMargins = "0px";
	if (sidebarVariant === "opaque") {
		sidebarBg = useColorModeValue("white", "gray.700");
		sidebarRadius = "20px";
		sidebarMargins = "12px 0px 12px 12px";
	}

	const sidebarWidth = isOpen ? "280px" : "80px";

	// SIDEBAR
	return (
		<SidebarContext.Provider value={{ isOpen, onToggle }}>
			<Box ref={mainPanel}>
				<Box display={{ sm: "none", xl: "block" }} position="fixed" zIndex="1000">
					<Box
						bg={sidebarBg}
						transition={variantChange}
						w={sidebarWidth}
						maxW={sidebarWidth}
						h="calc(100vh - 24px)"
						ps="12px"
						pe="12px"
						m={sidebarMargins}
						borderRadius={sidebarRadius}
						boxShadow="xl"
						border="1px solid"
						borderColor={useColorModeValue("gray.200", "gray.600")}
						position="relative"
					>
						{/* Toggle Button */}
						<IconButton
							icon={<Icon as={isOpen ? FaAngleLeft : FaBars} />}
							onClick={onToggle}
							position="absolute"
							top="20px"
							right="-15px"
							size="sm"
							borderRadius="full"
							bg={useColorModeValue("white", "gray.700")}
							border="2px solid"
							borderColor={useColorModeValue("gray.200", "gray.600")}
							color={useColorModeValue("gray.600", "white")}
							_hover={{
								bg: useColorModeValue("gray.50", "gray.600"),
								transform: "scale(1.1)",
							}}
							_active={{
								transform: "scale(0.95)",
							}}
							transition="all 0.2s"
							zIndex="1001"
						/>

						<SidebarContent
							routes={routes}
							logoText={"Africartz Booking"}
							display="none"
							sidebarVariant={sidebarVariant}
							isCollapsed={!isOpen}
						/>
					</Box>
				</Box>
			</Box>
		</SidebarContext.Provider>
	);
}

export default Sidebar;