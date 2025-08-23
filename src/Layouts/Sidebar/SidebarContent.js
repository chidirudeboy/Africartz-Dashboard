import { Box, Icon, Stack } from "@chakra-ui/react";
import React, { Fragment } from "react";
import {
  FaBookOpen,
  FaBuildingUser,
  FaUser,
  FaUserTag,
  FaUsers,
} from "react-icons/fa6";
import { MdAdminPanelSettings, MdApartment } from "react-icons/md";
import { RiReservedFill } from "react-icons/ri";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { Separator } from "../../components/Separator/Separator";
import SideBarLink from "./SideBarLink";
import { SidebarHelp } from "./SidebarHelp";
import AfricartzLogo from "../../assets/logo.png";

const SidebarContent = ({ logoText }) => {
  return (
    <>
      <Box pt={0} mb="1px">
        <Box
          display="flex"
          lineHeight="100%"
          mb="2px"
          fontWeight="bold"
          justifyContent="center"
          alignItems="center"
          fontSize="11px"
        >
          <img
            src={AfricartzLogo}
            w="28px"
            h="28px"
            me="5px"
            alt={logoText}
          />
        </Box>
        <Separator />
      </Box>
      <Box overflowY="auto" maxHeight="calc(100vh - 70px)">
        <Stack direction="column" mb="1.5rem" mt="1.5rem">
          <Fragment>
            <SideBarLink
              text="Dashboard"
              icon={<Icon as={TbLayoutDashboardFilled} w={5} h={5} />}
              route="admin/dashboard"
            />
            <SideBarLink
              text="Users"
              icon={<Icon as={FaUsers} w={5} h={5} />}
              route="admin/users"
            />
            <SideBarLink
              text="Pending Apartments"
              icon={<Icon as={FaUser} w={5} h={5} />}
              route="/admin/apartments"
            />
            <SideBarLink
              text="Approved Apartments"
              icon={<Icon as={MdApartment} w={5} h={5} />}
              route="/admin/approved-apartments"
            />
            <SideBarLink
              text="Bookings"
              icon={<Icon as={FaBookOpen} w={5} h={5} />}
              route="/admin/bookings"
            />
            <SideBarLink
              text="Owner/Agents"
              icon={<Icon as={FaUserTag} w={5} h={5} />}
              route="admin/agents"
            />

          </Fragment>
        </Stack>
      </Box>
      <SidebarHelp />
    </>
  );
};

export default SidebarContent;
