import { Box, Icon, Stack, Text, Tooltip, Divider, VStack } from "@chakra-ui/react";
import React, { Fragment } from "react";
import {
  FaBookOpen,
  FaBuildingUser,
  FaUser,
  FaUserTag,
  FaUsers,
} from "react-icons/fa6";
import { MdAdminPanelSettings, MdApartment, MdRateReview, MdStorefront } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";
import { RiReservedFill } from "react-icons/ri";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { Separator } from "../../components/Separator/Separator";
import SideBarLink from "./SideBarLink";
import { SidebarHelp } from "./SidebarHelp";
import AfricartzLogo from "../../assets/logo.png";

const SidebarContent = ({ logoText, isCollapsed }) => {
  return (
    <>
      {/* Logo Section */}
      <Box pt="20px" mb="20px">
        <Box
          display="flex"
          lineHeight="100%"
          mb="16px"
          fontWeight="bold"
          justifyContent={isCollapsed ? "center" : "flex-start"}
          alignItems="center"
          fontSize="16px"
          transition="all 0.3s ease"
        >
          <img
            src={AfricartzLogo}
            width={isCollapsed ? "35px" : "40px"}
            height={isCollapsed ? "35px" : "40px"}
            style={{
              marginRight: isCollapsed ? "0" : "12px",
              transition: "all 0.3s ease"
            }}
            alt={logoText}
          />
          {!isCollapsed && (
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold" color="#de9301" lineHeight="1.2">
                Africartz
              </Text>
              <Text fontSize="sm" color="gray.500" lineHeight="1">
                Booking Admin
              </Text>
            </VStack>
          )}
        </Box>
        <Divider />
      </Box>

      {/* Navigation Links */}
      <Box
        overflowY="auto"
        maxHeight="calc(100vh - 200px)"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E0',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#A0AEC0',
          },
        }}
      >
        <Stack direction="column" spacing="8px" mb="1.5rem">
          <Fragment>
            <SideBarLink
              text="Dashboard"
              icon={<Icon as={TbLayoutDashboardFilled} w={5} h={5} />}
              route="admin/dashboard"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Users"
              icon={<Icon as={FaUsers} w={5} h={5} />}
              route="admin/users"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Pending Apartments"
              icon={<Icon as={FaUser} w={5} h={5} />}
              route="/admin/apartments"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Approved Apartments"
              icon={<Icon as={MdApartment} w={5} h={5} />}
              route="/admin/approved-apartments"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Catalogue"
              icon={<Icon as={FaBookOpen} w={5} h={5} />}
              route="/admin/catalogue"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Removed Apartments"
              icon={<Icon as={FaUser} w={5} h={5} />}
              route="/admin/removed-apartments"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Review Resubmitted"
              icon={<Icon as={MdRateReview} w={5} h={5} />}
              route="/admin/review-resubmitted"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Bookings"
              icon={<Icon as={FaBookOpen} w={5} h={5} />}
              route="/admin/bookings"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Reservations"
              icon={<Icon as={RiReservedFill} w={5} h={5} />}
              route="/admin/reservations"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Owner/Agents"
              icon={<Icon as={FaUserTag} w={5} h={5} />}
              route="admin/agents"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Statistics"
              icon={<Icon as={IoStatsChart} w={5} h={5} />}
              route="/admin/statistics"
              isCollapsed={isCollapsed}
            />
            <SideBarLink
              text="Shop"
              icon={<Icon as={MdStorefront} w={5} h={5} />}
              route="/admin/shop"
              isCollapsed={isCollapsed}
            />
          </Fragment>
        </Stack>
      </Box>

      {/* Help Section - only show when expanded */}
      {!isCollapsed && <SidebarHelp />}
    </>
  );
};

export default SidebarContent;