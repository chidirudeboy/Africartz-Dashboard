import React, { useState } from "react";
import { Outlet } from "react-router-dom";
// Chakra imports
import { ChakraProvider, Portal, useDisclosure } from "@chakra-ui/react";
import Footer from "../components/Footer/AppFooter";
// Layout components
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "./Sidebar";
// Custom Chakra theme
import theme from "../theme/theme.js";
// Custom components
import { useLocation } from "react-router-dom";
import MainPanel from "../components/Panels/MainPanel";
import PanelContainer from "../components/Panels/PanelContainer";
import PanelContent from "../components/Panels/PanelContent";

function AppLayout() {
	// states and functions
	// eslint-disable-next-line
	const [sidebarVariant, setSidebarVariant] = useState("transparent");
	// const [sidebarVariant, setSidebarVariant] = useState("opaque");
	// eslint-disable-next-line
	const [fixed, setFixed] = useState(false);
	// eslint-disable-next-line
	const { isOpen, onOpen, onClose } = useDisclosure();
	document.documentElement.dir = "ltr";
	const location = useLocation();
	const activeRoute = () => {
		let route = location.pathname.split("/")[2];
		// capitalize the first letter of the route
		route = route.charAt(0).toUpperCase() + route.slice(1);
		return route;
	};
	return (
		<ChakraProvider theme={theme} resetCss={false}>
			<Sidebar
				logoText={"Africartz"}
				display="none"
				sidebarVariant={sidebarVariant}
			/>
			<MainPanel
				w={{
					base: "100%",
					xl: "calc(100% - 250px)",
				}}
			>
				<Portal>
					<AdminNavbar
						onOpen={onOpen}
						logoText={"Afri Bookings"}
						brandText={activeRoute()}
						// brandText={getActiveRoute(routes)}
						// secondary={getActiveNavbar(routes)}
						fixed={fixed}
					/>
				</Portal>
				<PanelContent>
					<PanelContainer>
						<Outlet />
					</PanelContainer>
				</PanelContent>
				<Footer />
			</MainPanel>
		</ChakraProvider>
	);
}

export default AppLayout;
