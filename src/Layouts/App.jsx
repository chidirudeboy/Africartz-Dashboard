import React, { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
// Chakra imports
import { ChakraProvider, Portal, useDisclosure } from "@chakra-ui/react";
import Footer from "../components/Footer/AppFooter";
// Layout components
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar, { useSidebar, SidebarContext } from "./Sidebar";
// Custom Chakra theme
import theme from "../theme/theme.js";
// Custom components
import { useLocation } from "react-router-dom";
import MainPanel from "../components/Panels/MainPanel";
import PanelContainer from "../components/Panels/PanelContainer";
import PanelContent from "../components/Panels/PanelContent";

// Component that consumes sidebar context for dynamic layout
const MainContent = () => {
	// Always call hooks at the top level
	const location = useLocation();
	// eslint-disable-next-line
	const [fixed, setFixed] = useState(false);
	// eslint-disable-next-line
	const { isOpen: navOpen, onOpen, onClose } = useDisclosure();

	// Get sidebar context with default fallback
	const sidebarContext = React.useContext(SidebarContext);
	const isOpen = sidebarContext?.isOpen ?? true; // default to true if context not available
	const sidebarWidth = isOpen ? "280px" : "80px";

	const activeRoute = () => {
		let route = location.pathname.split("/")[2];
		// capitalize the first letter of the route
		route = route.charAt(0).toUpperCase() + route.slice(1);
		return route;
	};

	return (
		<MainPanel
			w={{
				base: "100%",
				xl: `calc(100% - ${sidebarWidth})`,
			}}
			transition="all 0.3s ease"
			ml={{
				base: "0",
				xl: sidebarWidth
			}}
			position="relative"
		>
			<Portal>
				<AdminNavbar
					onOpen={onOpen}
					logoText={"Afri Bookings"}
					brandText={activeRoute()}
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
	);
};

function AppLayout() {
	// states and functions
	// eslint-disable-next-line
	const [sidebarVariant, setSidebarVariant] = useState("opaque");

	document.documentElement.dir = "ltr";

	return (
		<ChakraProvider theme={theme} resetCss={false}>
			<Sidebar
				logoText={"Africartz"}
				display="none"
				sidebarVariant={sidebarVariant}
			/>
			<MainContent />
		</ChakraProvider>
	);
}

export default AppLayout;
