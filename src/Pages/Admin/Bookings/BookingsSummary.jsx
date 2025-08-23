import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  Divider
} from '@chakra-ui/react';
import { AdminGetBookingsSummaryAPI } from '../../../Endpoints';

const BookingsSummary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchBookingsSummary();
  }, []);

  const fetchBookingsSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(AdminGetBookingsSummaryAPI, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings summary');
      }

      const data = await response.json();
      const processedData = {
        ...data.data,
        totalActiveAgents: data.data.totalAgents,
        totalRevenue: data.data.totalOnlineSales, // Only online payments for platform revenue
        totalBookings: data.data.totalBookings,
        totalOnlineBookings: data.data.totalOnlineBookings,
        totalManualBookings: data.data.totalManualBookings,
        totalManualSales: data.data.totalManualSales,
        avgCommissionRate: 10, // Default rate, could be calculated from data
        agentSummaries: data.data.agentsSalesData?.map(agent => ({
          agentName: agent.name || agent.agentName || agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : `Agent ${agent._id?.slice(-4) || 'Unknown'}`,
          totalBookings: (agent.totalOnlineBookings || 0) + (agent.totalManualBookings || 0),
          totalSales: (agent.totalOnlineSales || 0) + (agent.totalManualSales || 0),
          platformFee: (agent.totalOnlineSales || 0) * 0.1, // Platform fee only on online sales
          manualBookings: agent.totalManualBookings || 0,
          onlineBookings: agent.totalOnlineBookings || 0
        })) || []
      };
      setSummaryData(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box p={8} display="flex" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading bookings summary...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={4}>Platform Sales Overview</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6}>
            {/* Total Agents */}
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Active Agents</StatLabel>
                  <StatNumber color="blue.500">
                    {summaryData?.totalActiveAgents || 0}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Active in last 30 days
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Total Platform Revenue */}
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Platform Revenue</StatLabel>
                  <StatNumber color="green.500">
                    {formatCurrency(summaryData?.totalRevenue || 0)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Online earnings only
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Total Online Bookings */}
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Online Bookings</StatLabel>
                  <StatNumber color="blue.500">
                    {summaryData?.totalOnlineBookings || 0}
                  </StatNumber>
                  <StatHelpText>
                    Platform processed
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Total Manual Bookings */}
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Manual Bookings</StatLabel>
                  <StatNumber color="purple.500">
                    {summaryData?.totalManualBookings || 0}
                  </StatNumber>
                  <StatHelpText>
                    Offline bookings
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Average Commission */}
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Avg Commission Rate</StatLabel>
                  <StatNumber color="teal.500">
                    {summaryData?.avgCommissionRate || 0}%
                  </StatNumber>
                  <StatHelpText>
                    Platform fee percentage
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

      </VStack>
    </Box>
  );
};

export default BookingsSummary;