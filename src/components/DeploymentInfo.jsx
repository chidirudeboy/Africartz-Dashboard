import { Box, HStack, Icon, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { FaCloudArrowUp } from "react-icons/fa6";
import ENV_CONFIG from "../config/env";

const formatDeploymentTimestamp = (timestamp) => {
  if (!timestamp) {
    return "Local development";
  }

  const deployedAt = new Date(timestamp);

  if (Number.isNaN(deployedAt.getTime())) {
    return "Deployment time unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
    timeZoneName: "short",
  }).format(deployedAt);
};

const DeploymentInfo = ({ isCollapsed = false }) => {
  const timestamp = formatDeploymentTimestamp(ENV_CONFIG.DEPLOYED_AT);
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const iconBackground = useColorModeValue("yellow.50", "whiteAlpha.100");

  if (isCollapsed) {
    return (
      <Tooltip label={`Last deployment: ${timestamp}`} placement="right" hasArrow>
        <Box
          display="flex"
          justifyContent="center"
          borderTop="1px solid"
          borderColor={borderColor}
          pt="12px"
          pb="10px"
        >
          <Box bg={iconBackground} borderRadius="full" p="8px" color="#de9301">
            <Icon as={FaCloudArrowUp} display="block" boxSize="16px" />
          </Box>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box borderTop="1px solid" borderColor={borderColor} pt="12px" pb="10px">
      <HStack spacing="8px" align="flex-start">
        <Box bg={iconBackground} borderRadius="full" p="7px" color="#de9301">
          <Icon as={FaCloudArrowUp} display="block" boxSize="15px" />
        </Box>
        <Box minW={0}>
          <Text
            fontSize="10px"
            fontWeight="700"
            color={mutedColor}
            letterSpacing="0.06em"
            textTransform="uppercase"
            lineHeight="1.3"
          >
            Last deployment
          </Text>
          <Text fontSize="11px" fontWeight="600" lineHeight="1.45" mt="2px">
            {timestamp}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default DeploymentInfo;
