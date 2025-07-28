import { Card, Center } from "@chakra-ui/react";
import React from "react";
import { Link, Outlet } from "react-router-dom";
// import { AppLogo } from '../Endpoints';
// import WhatsappChat from '../components/Whatsapp/Index';

import AfricartzLogo from "../assets/logo.png";

function AuthLayout() {
	return (
		<div className="login-container">
			<Card p="30" width={{ sm: "30rem", md: "30rem", xl: "30rem" }}>
				<Center mb={"50px"}>
					<Link to="/">
						<img
							className="logo"
							src={AfricartzLogo}
							alt="Africarts"
							width="200px"
							height="200px"
						/>
					</Link>
				</Center>
				<Outlet />
				{/* <WhatsappChat /> */}
			</Card>
		</div>
	);
}

export default AuthLayout;
