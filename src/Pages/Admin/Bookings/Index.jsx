import React, { useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FaChartLine, FaList } from 'react-icons/fa';
import BookingsSummary from './BookingsSummary';
import AllBookings from './AllBookings';

const BookingsIndex = () => {
  const [tabIndex, setTabIndex] = useState(0);
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={6} pt={20}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Bookings Management
          </Text>
          <Text color="gray.500">
            Monitor and manage all platform bookings
          </Text>
        </Box>

        <Box bg={bg} borderRadius="lg" border={`1px solid ${borderColor}`} overflow="hidden" mt={4}>
          <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed">
            <TabList bg="gray.50" borderBottom={`1px solid ${borderColor}`}>
              <Tab _selected={{ bg: 'white', borderBottom: '2px solid', borderColor: 'blue.500' }}>
                <HStack spacing={2}>
                  <Icon as={FaChartLine} />
                  <Text>Sales Summary</Text>
                </HStack>
              </Tab>
              <Tab _selected={{ bg: 'white', borderBottom: '2px solid', borderColor: 'blue.500' }}>
                <HStack spacing={2}>
                  <Icon as={FaList} />
                  <Text>All Bookings</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <BookingsSummary />
              </TabPanel>
              <TabPanel p={0}>
                <AllBookings />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Box>
  );
};

export default BookingsIndex;