import React, { useContext } from "react";
import GlobalContext from '../../Context';
// import { LockIcon } from "@chakra-ui/icons";
// eslint-disable-next-line
import { Button, Flex, Text } from "@chakra-ui/react";
// import SidebarHelpImage from "../../assets/img/SidebarHelpImage.jpg";
// import IconBox from "../../components/Icons/IconBox";

export function SidebarHelp(props) {
  // Pass the computed styles into the `__css` prop

  // eslint-disable-next-line
  const { children, ...rest } = props;

  const { logOut } = useContext(GlobalContext);

  return (
		<Flex
			borderRadius="15px"
			flexDirection="column"
			//   bgImage={SidebarHelpImage}
			justifyContent="flex-start"
			alignItems="start"
			boxSize="border-box"
			mb="30px"
			//   h="170px"
			h="fit-content"
			w="100%"
		>
			{/* <IconBox width="35px" h="35px" bg="white" mb="auto">
        <LockIcon color="red.300" h="18px" w="18px" />
      </IconBox>
      <Text fontSize="sm" color="white" fontWeight="bolder">
        All Done?
      </Text>
      <Text fontSize="xs" color="black" fontWeight='bold' mb="10px">
        Keep your account safe
      </Text> */}
			<Button
				onClick={() => {
					logOut();
				}}
				fontSize="12px"
				fontWeight="medium"
			  w="100%"
			  borderRadius={'100px'}
				bg="#fbca07"
				_hover="none"
				_active={{
					bg: "white",
					transform: "none",
					borderColor: "transparent",
				}}
				_focus={{
					boxShadow: "none",
				}}
				color="white"
			>
				Log Out
			</Button>
		</Flex>
  );
}
