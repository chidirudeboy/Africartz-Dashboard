import { Box, Button } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { AppLogo } from "../../Endpoints";
import "./header.css";

const Header = () => {
	return (
		<Box
			position={"absolute"}
			width={"100%"}
			pt="30px"
			display={"flex"}
			alignItems={"center"}
			justifyContent={{ base: "space-around", md: "space-between" }}
			// bg={"whiteAlpha.700"}
			py={{ xl: "3", md: "3" }}
			px={{ xl: "20", md: "20" }}
			zIndex="19999"
			mt="3"
		>
			<div className="logo">
				<Link to="/">
					<img src={AppLogo} alt="Logo" />
				</Link>
			</div>
			{/* <Link to="/login"> */}
			<Link to="/admin/login">
				<Button
					p={"8px 40px"}
					borderRadius={"24px"}
					color="black"
					bg="white"
				>
					Log in
				</Button>
			</Link>
		</Box>
	);
};

export default Header;
