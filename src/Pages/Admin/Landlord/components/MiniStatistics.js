// Chakra imports
import {
	Flex,
	Icon,
	Stat,
	//   eslint-disable-next-line
	StatHelpText,
	StatLabel,
	StatNumber,
	useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "../../../../components/Card/Card.js";
import CardBody from "../../../../components/Card/CardBody.js";
import IconBox from "../../../../components/Icons/IconBox";
import React from "react";
import { numberWithCommas } from "../../../../utils/index.js";

const MiniStatistics = ({ title, amount, percentage, icon }) => {
	const iconTeal = useColorModeValue("black", "#de9301");
  const textColor = useColorModeValue("gray.700", "white");
	const iconBoxInside = useColorModeValue("#fccb08", "white");
  

	return (
		<Card minH="83px">
			<CardBody>
				<Flex
					flexDirection="row"
					flexWrap="nowrap"
					align="center"
					justify="center"
					w="100%"
				>
					<Stat me="auto">
						<StatLabel
							fontSize="sm"
							color="gray.400"
							fontWeight="medium"
							pb=".1rem"
						>
							{title}
						</StatLabel>
						<Flex>
							<StatNumber fontSize="lg" color={textColor}>
								{numberWithCommas(amount)}
							</StatNumber>
							{/* <StatHelpText
                alignSelf='flex-end'
                justifySelf='flex-end'
                m='0px'
                color={percentage > 0 ? "green.400" : "red.400"}
                fontWeight='bold'
                ps='3px'
                fontSize='md'>
                {percentage > 0 ? `+${percentage}%` : `${percentage}%`}
              </StatHelpText> */}
						</Flex>
					</Stat>
					<IconBox as="box" h={"36px"} w={"36px"} bg={iconTeal}>
						<Icon
							as={icon}
							h={"18px"}
							w={"18px"}
							color={iconBoxInside}
						/>
					</IconBox>
				</Flex>
			</CardBody>
		</Card>
	);
};

export default MiniStatistics;
