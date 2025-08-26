import { useState, useEffect, useCallback } from 'react';
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
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Heading,
  ButtonGroup,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Icon
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { AdminGetAllReservationsAPI } from '../../../Endpoints';

const ReservationsIndex = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  const fetchAllReservations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${AdminGetAllReservationsAPI}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      setReservations(data.data?.reservations || []);
      setPagination(data.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAllReservations();
  }, [fetchAllReservations]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
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
      'accepted': 'green',
      'cancelled': 'red',
      'confirmed': 'blue',
      'completed': 'purple'
    };
    return colors[status] || 'gray';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReservationType = (type) => {
    const types = {
      'normal': 'Normal',
      'emergency': 'Emergency',
      'extended': 'Extended'
    };
    return types[type] || type;
  };

  if (loading && (!reservations || reservations.length === 0)) {
    return (
      <Box p={8} display="flex" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading reservations...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} pt={20}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} pt={20}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Reservations Management
          </Text>
          <Text color="gray.500">
            Monitor and manage all platform reservations
          </Text>
        </Box>

        {/* Filters */}
        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>Filters & Search</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
              <Box>
                <Text fontSize="sm" mb={2}>Search</Text>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by name, email, apartment..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </InputGroup>
              </Box>

              <Box>
                <Text fontSize="sm" mb={2}>Status</Text>
                <Select
                  placeholder="All Statuses"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" mb={2}>Check-in From</Text>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="sm" mb={2}>Check-in To</Text>
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
              {pagination.total} reservations
            </Text>
            <Text fontSize="sm" color="gray.500">
              Page {pagination.page} of {pagination.pages}
            </Text>
          </HStack>
        </Box>

        {/* Reservations Table */}
        <Card>
          <CardBody p={0}>
            {reservations && reservations.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Reservation ID</Th>
                      <Th>Guest</Th>
                      <Th>Apartment</Th>
                      <Th>Agent</Th>
                      <Th>Check-in</Th>
                      <Th>Check-out</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {reservations.map((reservation, index) => (
                      <Tr key={reservation._id || index}>
                        <Td fontSize="sm" fontFamily="mono">
                          {reservation._id ? reservation._id.slice(-8) : 'N/A'}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {reservation.userFirstName} {reservation.userLastName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {reservation.userId?.email || 'N/A'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {reservation.apartmentName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {reservation.apartmentAddress}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {reservation.apartmentState}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm">
                              {reservation.agentId?.firstName} {reservation.agentId?.lastName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {reservation.agentId?.email}
                            </Text>
                          </VStack>
                        </Td>
                        <Td fontSize="sm">
                          {reservation.checkInDate ? formatDate(reservation.checkInDate) : 'N/A'}
                        </Td>
                        <Td fontSize="sm">
                          {reservation.checkOutDate ? formatDate(reservation.checkOutDate) : 'N/A'}
                        </Td>
                        <Td fontSize="sm">
                          {getReservationType(reservation.reservationType)}
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(reservation.status)} size="sm">
                            {reservation.status}
                          </Badge>
                        </Td>
                        <Td fontSize="sm">
                          {reservation.createdAt ? formatDate(reservation.createdAt) : 'N/A'}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box p={8} textAlign="center">
                <Text color="gray.500">No reservations found</Text>
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

export default ReservationsIndex;