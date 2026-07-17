import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useToast,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import SelectSearch from 'react-select';
import {
  AdminCreateBackfillBookingAPI,
  AdminGetAgentAPI,
  AdminGetAllBookingsAPI,
  AdminGetApprovedApartmentsAPI,
  AdminGetUsersAPI,
  AdminReleaseBookingPayoutAPI
} from '../../../Endpoints';

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
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [releaseReason, setReleaseReason] = useState('');
  const [releasing, setReleasing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupLoaded, setLookupLoaded] = useState(false);
  const [agentOptions, setAgentOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [backfillForm, setBackfillForm] = useState({
    mode: 'historical_backfill',
    payoutMode: 'wallet_only',
    agentId: '',
    userId: '',
    propertyId: '',
    checkInDate: '',
    checkOutDate: '',
    bookingCreatedAt: '',
    payoutReleasedAt: '',
    withdrawnAt: '',
    actualPrice: '',
    sellingPrice: '',
    reservationType: 'normal',
    note: '',
  });
  const toast = useToast();
  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 2000 }),
    menu: (base) => ({ ...base, zIndex: 2000 }),
    control: (base, state) => ({
      ...base,
      minHeight: '48px',
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#3182ce' : '#E2E8F0',
      boxShadow: state.isFocused ? '0 0 0 1px #3182ce' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3182ce' : '#CBD5E0'
      }
    })
  };


  const fetchAllBookings = useCallback(async () => {
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
  }, [filters]);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

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

  const getPayoutStatusColor = (status) => {
    const colors = {
      'held': 'orange',
      'released': 'green'
    };
    return colors[status] || 'gray';
  };

  const getBookingId = (booking) => booking?._id || booking?.id;
  const canReleasePayout = (booking) => {
    const status = booking?.status;
    return (
      booking?.payoutStatus === 'held' &&
      status !== 'payment_failed' &&
      status !== 'cancelled' &&
      status !== 'pending_payment' &&
      Boolean(booking?.payoutReleaseCodeHash)
    );
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

  const openReleaseModal = (booking) => {
    setSelectedBooking(booking);
    setReleaseReason('');
    setReleaseModalOpen(true);
  };

  const openCreateModal = () => {
    setBackfillForm({
      mode: 'historical_backfill',
      payoutMode: 'wallet_only',
      agentId: '',
      userId: '',
      propertyId: '',
      checkInDate: '',
      checkOutDate: '',
      bookingCreatedAt: '',
      payoutReleasedAt: '',
      withdrawnAt: '',
      actualPrice: '',
      sellingPrice: '',
      reservationType: 'normal',
      note: '',
    });
    setCreateModalOpen(true);
    if (!lookupLoaded) {
      fetchLookupData();
    }
  };

  const closeCreateModal = () => {
    if (creating) return;
    setCreateModalOpen(false);
  };

  const updateBackfillForm = (key, value) => {
    setBackfillForm((prev) => ({ ...prev, [key]: value }));
  };

  const fetchLookupData = useCallback(async () => {
    try {
      setLookupLoading(true);
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      };

      const [agentsResponse, usersResponse, propertiesResponse] = await Promise.all([
        axios.get(AdminGetAgentAPI, { headers }),
        axios.get(AdminGetUsersAPI, { headers }),
        axios.get(AdminGetApprovedApartmentsAPI, { headers })
      ]);

      const nextAgentOptions = (agentsResponse.data?.data || [])
        .map((agent) => ({
          value: agent._id,
          label: `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email,
          email: agent.email,
          phone: agent.phone
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      const nextUserOptions = (usersResponse.data?.data || [])
        .map((user) => ({
          value: user._id,
          label: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          email: user.email,
          phone: user.phone
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      const nextPropertyOptions = (propertiesResponse.data?.apartments || [])
        .map((property) => ({
          value: property._id,
          label: `${property.apartmentName} - ${property.city}, ${property.state}`,
          apartmentName: property.apartmentName,
          city: property.city,
          state: property.state,
          agentId: typeof property.agentId === 'object' ? property.agentId?._id : property.agentId,
          agentName: typeof property.agentId === 'object'
            ? `${property.agentId?.firstName || ''} ${property.agentId?.lastName || ''}`.trim()
            : ''
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setAgentOptions(nextAgentOptions);
      setUserOptions(nextUserOptions);
      setPropertyOptions(nextPropertyOptions);
      setLookupLoaded(true);
    } catch (err) {
      toast({
        title: 'Lookup load failed',
        description: err.response?.data?.message || err.message || 'Failed to load agents, users, and properties',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLookupLoading(false);
    }
  }, [toast]);

  const closeReleaseModal = () => {
    if (releasing) return;
    setReleaseModalOpen(false);
    setSelectedBooking(null);
    setReleaseReason('');
  };

  const handleAdminRelease = async () => {
    const bookingId = getBookingId(selectedBooking);
    if (!bookingId) {
      toast({
        title: 'Missing booking ID',
        description: 'This booking is missing an ID. Please refresh and try again.',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
      return;
    }
    if (!releaseReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for releasing this payout.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    try {
      setReleasing(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(AdminReleaseBookingPayoutAPI(bookingId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: releaseReason.trim() })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to release payout');
      }

      toast({
        title: 'Payout released',
        description: 'Funds have been released to the eligible agent.',
        status: 'success',
        duration: 4000,
        isClosable: true
      });
      closeReleaseModal();
      fetchAllBookings();
    } catch (err) {
      toast({
        title: 'Release failed',
        description: err.message || 'Unable to release payout',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setReleasing(false);
    }
  };

  const handleCreateBackfillBooking = async () => {
    if (!backfillForm.agentId || !backfillForm.userId || !backfillForm.propertyId) {
      toast({
        title: 'Missing IDs',
        description: 'Agent ID, User ID, and Property ID are required.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    if (!backfillForm.checkInDate || !backfillForm.checkOutDate) {
      toast({
        title: 'Missing dates',
        description: 'Check-in and check-out dates are required.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    if (!backfillForm.actualPrice || !backfillForm.sellingPrice) {
      toast({
        title: 'Missing prices',
        description: 'Actual price and selling price are required.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem('authToken');
      const payload = {
        ...backfillForm,
        actualPrice: Number(backfillForm.actualPrice),
        sellingPrice: Number(backfillForm.sellingPrice),
        payoutMode: backfillForm.mode === 'future_booking' ? 'wallet_only' : backfillForm.payoutMode,
        bookingCreatedAt: backfillForm.bookingCreatedAt || undefined,
        payoutReleasedAt: backfillForm.mode === 'historical_backfill' ? (backfillForm.payoutReleasedAt || undefined) : undefined,
        withdrawnAt: backfillForm.mode === 'historical_backfill' && backfillForm.payoutMode === 'withdrawn'
          ? backfillForm.withdrawnAt || undefined
          : undefined,
        note: backfillForm.note || undefined
      };

      const response = await fetch(AdminCreateBackfillBookingAPI, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Failed to create backfill booking');
      }

      toast({
        title: 'Booking created',
        description: 'The manual booking record has been created successfully.',
        status: 'success',
        duration: 4000,
        isClosable: true
      });
      closeCreateModal();
      fetchAllBookings();
    } catch (err) {
      toast({
        title: 'Creation failed',
        description: err.message || 'Unable to create backfill booking',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setCreating(false);
    }
  };

  const selectedAgentOption = agentOptions.find((option) => option.value === backfillForm.agentId) || null;
  const selectedUserOption = userOptions.find((option) => option.value === backfillForm.userId) || null;
  const selectedPropertyOption = propertyOptions.find((option) => option.value === backfillForm.propertyId) || null;

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
          <Button colorScheme="blue" onClick={openCreateModal}>
            Add Backfill Booking
          </Button>
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
                      <Th>Payout</Th>
                      <Th>Released By</Th>
                      <Th>Release Reason</Th>
                      <Th>Action</Th>
                      <Th>Created</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {bookings && bookings.map((booking, index) => (
                      <Tr key={getBookingId(booking) || index}>
                        <Td fontSize="sm" fontFamily="mono">
                          {getBookingId(booking) ? getBookingId(booking).slice(-8) : 'N/A'}
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
                        <Td>
                          <Badge colorScheme={getPayoutStatusColor(booking.payoutStatus || 'held')} size="sm">
                            {booking.payoutStatus || 'held'}
                          </Badge>
                        </Td>
                        <Td fontSize="sm">
                          {booking.payoutReleasedByAdminId?.email || booking.payoutReleasedByAdminId || 'N/A'}
                        </Td>
                        <Td fontSize="sm" maxW="220px">
                          {booking.payoutReleaseReason || 'N/A'}
                        </Td>
                        <Td>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            isDisabled={!canReleasePayout(booking) || !getBookingId(booking)}
                            onClick={() => openReleaseModal(booking)}
                          >
                            Release
                          </Button>
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

      <Modal isOpen={releaseModalOpen} onClose={closeReleaseModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Release Payout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color="gray.600">
                You are about to release payout for booking{' '}
                <Text as="span" fontWeight="bold">
                  {getBookingId(selectedBooking)?.slice(-8) || 'N/A'}
                </Text>.
              </Text>
              <Box>
                <Text fontSize="sm" mb={2}>Reason</Text>
                <Textarea
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  placeholder="Provide a short reason for this admin release"
                  resize="vertical"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeReleaseModal} isDisabled={releasing}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAdminRelease}
              isLoading={releasing}
            >
              Release Payout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={createModalOpen} onClose={closeCreateModal} size="2xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Historical or Future Booking</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Mode</FormLabel>
                  <Select value={backfillForm.mode} onChange={(e) => updateBackfillForm('mode', e.target.value)}>
                    <option value="historical_backfill">Historical backfill</option>
                    <option value="future_booking">Future booking</option>
                  </Select>
                </FormControl>
                <FormControl isDisabled={backfillForm.mode === 'future_booking'}>
                  <FormLabel>Payout status</FormLabel>
                  <Select value={backfillForm.payoutMode} onChange={(e) => updateBackfillForm('payoutMode', e.target.value)}>
                    <option value="wallet_only">Leave in wallet</option>
                    <option value="withdrawn">Mark as withdrawn</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Agent ID</FormLabel>
                  <SelectSearch
                    isClearable
                    isSearchable
                    options={agentOptions}
                    value={selectedAgentOption}
                    onChange={(option) => updateBackfillForm('agentId', option?.value || '')}
                    placeholder={lookupLoading ? 'Loading agents...' : 'Search and select an agent'}
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                    formatOptionLabel={(option) => (
                      <Box>
                        <Text fontWeight="medium">{option.label}</Text>
                        <Text fontSize="xs" color="gray.500">{option.email}</Text>
                      </Box>
                    )}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>User ID</FormLabel>
                  <SelectSearch
                    isClearable
                    isSearchable
                    options={userOptions}
                    value={selectedUserOption}
                    onChange={(option) => updateBackfillForm('userId', option?.value || '')}
                    placeholder={lookupLoading ? 'Loading users...' : 'Search and select a user'}
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                    formatOptionLabel={(option) => (
                      <Box>
                        <Text fontWeight="medium">{option.label}</Text>
                        <Text fontSize="xs" color="gray.500">{option.email}</Text>
                      </Box>
                    )}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Property ID</FormLabel>
                  <SelectSearch
                    isClearable
                    isSearchable
                    options={propertyOptions}
                    value={selectedPropertyOption}
                    onChange={(option) => {
                      updateBackfillForm('propertyId', option?.value || '');
                      if (option?.agentId) {
                        updateBackfillForm('agentId', option.agentId);
                      }
                    }}
                    placeholder={lookupLoading ? 'Loading properties...' : 'Search and select a property'}
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                    formatOptionLabel={(option) => (
                      <Box>
                        <Text fontWeight="medium">{option.apartmentName || option.label}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {option.city}, {option.state}{option.agentName ? ` - ${option.agentName}` : ''}
                        </Text>
                      </Box>
                    )}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Request type</FormLabel>
                  <Select value={backfillForm.reservationType} onChange={(e) => updateBackfillForm('reservationType', e.target.value)}>
                    <option value="normal">Normal stay</option>
                    <option value="party">Party</option>
                    <option value="movie">Movie shoot</option>
                    <option value="photo">Photo shoot</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Check-in date</FormLabel>
                  <Input type="datetime-local" value={backfillForm.checkInDate} onChange={(e) => updateBackfillForm('checkInDate', e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Check-out date</FormLabel>
                  <Input type="datetime-local" value={backfillForm.checkOutDate} onChange={(e) => updateBackfillForm('checkOutDate', e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Booking created at</FormLabel>
                  <Input type="datetime-local" value={backfillForm.bookingCreatedAt} onChange={(e) => updateBackfillForm('bookingCreatedAt', e.target.value)} />
                </FormControl>
                <FormControl isDisabled={backfillForm.mode === 'future_booking'}>
                  <FormLabel>Payout released at</FormLabel>
                  <Input type="datetime-local" value={backfillForm.payoutReleasedAt} onChange={(e) => updateBackfillForm('payoutReleasedAt', e.target.value)} />
                </FormControl>
                <FormControl isDisabled={backfillForm.mode === 'future_booking' || backfillForm.payoutMode !== 'withdrawn'}>
                  <FormLabel>Withdrawn at</FormLabel>
                  <Input type="datetime-local" value={backfillForm.withdrawnAt} onChange={(e) => updateBackfillForm('withdrawnAt', e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Actual price</FormLabel>
                  <Input type="number" value={backfillForm.actualPrice} onChange={(e) => updateBackfillForm('actualPrice', e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Selling price</FormLabel>
                  <Input type="number" value={backfillForm.sellingPrice} onChange={(e) => updateBackfillForm('sellingPrice', e.target.value)} />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Internal note</FormLabel>
                <Textarea
                  value={backfillForm.note}
                  onChange={(e) => updateBackfillForm('note', e.target.value)}
                  placeholder="Optional note for why this booking is being backfilled"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeCreateModal} isDisabled={creating}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateBackfillBooking} isLoading={creating}>
              Create Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AllBookings;
