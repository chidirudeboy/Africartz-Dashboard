import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Select,
  Input,
  Badge,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Heading,
  ButtonGroup,
  SimpleGrid
} from '@chakra-ui/react';
import { AdminGetAllBookingsAPI } from '../../../Endpoints';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    startDate: '',
    endDate: '',
    agentId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });


  useEffect(() => {
    fetchAllBookings();
  }, [filters]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${AdminGetAllBookingsAPI}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data?.bookings || []);
      setPagination(data.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'yellow',
      'booked': 'blue',
      'completed': 'green',
      'cancelled': 'red',
      'pending_payment': 'orange'
    };
    return colors[status] || 'gray';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && (!bookings || bookings.length === 0)) {
    return (
      <Box p={8} display="flex" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading all bookings...</Text>
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
        {/* Filters */}
        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>Filters</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <Box>
                <Text fontSize="sm" mb={2}>Status</Text>
                <Select
                  placeholder="All Statuses"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending_payment">Pending Payment</option>
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" mb={2}>Start Date</Text>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="sm" mb={2}>End Date</Text>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="sm" mb={2}>Results per page</Text>
                <Select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Results Summary */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Text>
              Showing {((pagination.page - 1) * filters.limit) + 1} to{' '}
              {Math.min(pagination.page * filters.limit, pagination.total)} of{' '}
              {pagination.total} bookings
            </Text>
            <Text fontSize="sm" color="gray.500">
              Page {pagination.page} of {pagination.pages}
            </Text>
          </HStack>
        </Box>

        {/* Bookings Table */}
        <Card>
          <CardBody p={0}>
            {bookings && bookings.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Booking ID</Th>
                      <Th>Property</Th>
                      <Th>Agent</Th>
                      <Th>Guest</Th>
                      <Th>Check-in</Th>
                      <Th>Check-out</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {bookings && bookings.filter(booking => !booking.transactionRef?.startsWith('Offline-')).map((booking, index) => (
                      <Tr key={booking._id || index}>
                        <Td fontSize="sm" fontFamily="mono">
                          {booking._id ? booking._id.slice(-8) : 'N/A'}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {booking.propertyId?.apartmentName || 'N/A'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {booking.propertyId?.city}, {booking.propertyId?.state}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm">
                              {booking.agentId?.firstName} {booking.agentId?.lastName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {booking.agentId?.email}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm">
                              {booking.firstName} {booking.lastName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {booking.email}
                            </Text>
                          </VStack>
                        </Td>
                        <Td fontSize="sm">{booking.checkInDate ? formatDate(booking.checkInDate) : 'N/A'}</Td>
                        <Td fontSize="sm">{booking.checkOutDate ? formatDate(booking.checkOutDate) : 'N/A'}</Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {formatCurrency(booking.pricing?.sellingPrice || 0)}
                            </Text>
                            {booking.pricing?.profitAmount && booking.pricing.profitAmount > 0 && (
                              <Text fontSize="xs" color="green.500">
                                +{formatCurrency(booking.pricing.profitAmount)} profit
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(booking.status || 'pending')} size="sm">
                            {booking.status || 'N/A'}
                          </Badge>
                        </Td>
                        <Td fontSize="sm">{booking.createdAt ? formatDate(booking.createdAt) : 'N/A'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box p={8} textAlign="center">
                <Text color="gray.500">No bookings found</Text>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box display="flex" justifyContent="center">
            <ButtonGroup spacing={2}>
              <Button
                size="sm"
                onClick={() => handlePageChange(1)}
                isDisabled={pagination.page === 1}
              >
                First
              </Button>
              <Button
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                isDisabled={pagination.page === 1}
              >
                Previous
              </Button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.page - 2) + i;
                if (pageNum > pagination.pages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={pageNum === pagination.page ? 'solid' : 'outline'}
                    colorScheme={pageNum === pagination.page ? 'blue' : 'gray'}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                isDisabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
              <Button
                size="sm"
                onClick={() => handlePageChange(pagination.pages)}
                isDisabled={pagination.page === pagination.pages}
              >
                Last
              </Button>
            </ButtonGroup>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AllBookings;