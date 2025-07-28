import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '../../src/Layouts/Sidebar/SidebarContent';

const Layout = ({ children }) => {
  return (
    <Flex>
      <Sidebar />
      <Box flex="1" ml={{ base: 0, md: '250px' }} p="4">
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;