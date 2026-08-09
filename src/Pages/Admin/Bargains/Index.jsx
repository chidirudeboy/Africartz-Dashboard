import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { AdminGetAllBargainsAPI, AdminGetBargainByIdAPI } from '../../../Endpoints';

const currency = (amount) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN'
}).format(Number(amount || 0));

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const formatDateOnly = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'countered':
      return 'orange';
    case 'accepted':
      return 'blue';
    case 'paid':
      return 'green';
    case 'rejected':
      return 'red';
    case 'expired':
      return 'gray';
    case 'cancelled':
      return 'gray';
    default:
      return 'gray';
  }
};

const getHistorySenderColor = (senderType) => {
  if (senderType === 'agent') return 'orange';
  return 'blue';
};

const BargainsIndex = () => {
  const toast = useToast();
  const [bargains, setBargains] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedBargain, setSelectedBargain] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const historyBg = useColorModeValue('gray.50', 'gray.900');

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const fetchBargains = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(AdminGetAllBargainsAPI, {
        headers: authHeaders,
        params: filters
      });

      setBargains(response?.data?.data?.bargains || []);
      setPagination(response?.data?.data?.pagination || { page: 1, pages: 1, total: 0, limit: filters.limit });
    } catch (error) {
      toast({
        title: 'Failed to load bargains',
        description: error?.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  }, [authHeaders, filters, toast]);

  useEffect(() => {
    fetchBargains();
  }, [fetchBargains]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const openDetails = async (bargainId) => {
    try {
      setLoadingDetails(true);
      setDetailsOpen(true);
      const response = await axios.get(AdminGetBargainByIdAPI(bargainId), {
        headers: authHeaders
      });
      setSelectedBargain(response?.data?.data || null);
    } catch (error) {
      setDetailsOpen(false);
      toast({
        title: 'Failed to load bargain details',
        description: error?.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <Box p={6} pt={20}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>Bargains</Text>
          <Text color={mutedColor}>
            Monitor negotiation activity, agreed pricing, and payment state for user-initiated bargain requests.
          </Text>
        </Box>

        <Box bg={cardBg} borderRadius="lg" border={`1px solid ${borderColor}`} p={4}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Box>
              <Text fontSize="sm" mb={2}>Status</Text>
              <Select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="countered">Countered</option>
                <option value="accepted">Accepted</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </Box>
            <Box>
              <Text fontSize="sm" mb={2}>Start date</Text>
              <Input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} />
            </Box>
            <Box>
              <Text fontSize="sm" mb={2}>End date</Text>
              <Input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} />
            </Box>
            <Box>
              <Text fontSize="sm" mb={2}>Results per page</Text>
              <Select value={filters.limit} onChange={(e) => handleFilterChange('limit', Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </Select>
            </Box>
          </SimpleGrid>
        </Box>

        <Box bg={cardBg} borderRadius="lg" border={`1px solid ${borderColor}`} overflow="hidden">
          <Flex px={4} py={3} borderBottom={`1px solid ${borderColor}`} justify="space-between" align="center">
            <Text fontWeight="semibold">Showing {bargains.length} of {pagination.total} bargains</Text>
            <Button size="sm" colorScheme="blue" onClick={fetchBargains}>Refresh</Button>
          </Flex>

          {loading ? (
            <Flex justify="center" py={10}><Spinner size="lg" /></Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Guest</Th>
                    <Th>Agent</Th>
                    <Th>Property</Th>
                    <Th>Stay</Th>
                    <Th>Status</Th>
                    <Th>Offer</Th>
                    <Th>Fees at payment</Th>
                    <Th>Created</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bargains.map((bargain) => (
                    <Tr key={bargain._id || bargain.id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{`${bargain.userId?.first_name || ''} ${bargain.userId?.last_name || ''}`.trim() || 'Unknown user'}</Text>
                          <Text fontSize="sm" color={mutedColor}>{bargain.userId?.email || 'N/A'}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{`${bargain.agentId?.firstName || ''} ${bargain.agentId?.lastName || ''}`.trim() || 'Unknown agent'}</Text>
                          <Text fontSize="sm" color={mutedColor}>{bargain.agentId?.email || 'N/A'}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{bargain.propertyId?.apartmentName || 'Unknown property'}</Text>
                          <Text fontSize="sm" color={mutedColor}>{bargain.propertyId?.city || 'N/A'}, {bargain.propertyId?.state || 'N/A'}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{formatDateOnly(bargain.checkInDate)} - {formatDateOnly(bargain.checkOutDate)}</Text>
                          <Text fontSize="sm" color={mutedColor}>{bargain.reservationType || 'normal'}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(bargain.status)}>{bargain.status}</Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">Original: {currency(bargain.originalTotalPrice)}</Text>
                          <Text fontSize="sm" fontWeight="semibold">Offer: {currency(bargain.finalAgreedPrice || bargain.offeredTotalPrice)}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">Service: {currency(bargain.serviceFeeAtCheckout)}</Text>
                          <Text fontSize="sm">Paystack: {currency(bargain.paystackFeeAtCheckout)}</Text>
                          <Text fontSize="sm">Caution: {currency(bargain.cautionFeeAtCheckout)}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{formatDateTime(bargain.createdAt)}</Text>
                      </Td>
                      <Td>
                        <Button size="sm" colorScheme="blue" variant="outline" onClick={() => openDetails(bargain._id || bargain.id)}>
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          <Flex px={4} py={3} justify="space-between" align="center" borderTop={`1px solid ${borderColor}`}>
            <Text fontSize="sm" color={mutedColor}>Page {pagination.page} of {pagination.pages || 1}</Text>
            <HStack>
              <Button size="sm" onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))} isDisabled={pagination.page <= 1}>Previous</Button>
              <Button size="sm" onClick={() => handleFilterChange('page', Math.min(pagination.pages || 1, pagination.page + 1))} isDisabled={pagination.page >= (pagination.pages || 1)}>Next</Button>
            </HStack>
          </Flex>
        </Box>
      </VStack>

      <Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bargain Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {loadingDetails || !selectedBargain ? (
              <Flex justify="center" py={10}><Spinner size="lg" /></Flex>
            ) : (
              <VStack spacing={5} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box border={`1px solid ${borderColor}`} borderRadius="lg" p={4}>
                    <Text fontWeight="bold" mb={3}>Overview</Text>
                    <VStack align="start" spacing={2}>
                      <Text><strong>Status:</strong> <Badge ml={2} colorScheme={getStatusColor(selectedBargain.status)}>{selectedBargain.status}</Badge></Text>
                      <Text><strong>Guest:</strong> {`${selectedBargain.userId?.first_name || ''} ${selectedBargain.userId?.last_name || ''}`.trim()}</Text>
                      <Text><strong>Agent:</strong> {`${selectedBargain.agentId?.firstName || ''} ${selectedBargain.agentId?.lastName || ''}`.trim()}</Text>
                      <Text><strong>Property:</strong> {selectedBargain.propertyId?.apartmentName || 'N/A'}</Text>
                      <Text><strong>Stay:</strong> {formatDateOnly(selectedBargain.checkInDate)} - {formatDateOnly(selectedBargain.checkOutDate)}</Text>
                      <Text><strong>Expires at:</strong> {formatDateTime(selectedBargain.expiresAt)}</Text>
                      <Text><strong>Accepted booking:</strong> {selectedBargain.acceptedBookingId?.transactionRef || 'N/A'}</Text>
                    </VStack>
                  </Box>

                  <Box border={`1px solid ${borderColor}`} borderRadius="lg" p={4}>
                    <Text fontWeight="bold" mb={3}>Pricing</Text>
                    <SimpleGrid columns={2} spacing={3}>
                      <Box>
                        <Text fontSize="sm" color={mutedColor}>Original stay price</Text>
                        <Text fontWeight="semibold">{currency(selectedBargain.originalTotalPrice)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={mutedColor}>Current agreed price</Text>
                        <Text fontWeight="semibold">{currency(selectedBargain.finalAgreedPrice || selectedBargain.offeredTotalPrice)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={mutedColor}>Service fee</Text>
                        <Text>{currency(selectedBargain.serviceFeeAtCheckout)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={mutedColor}>Paystack fee</Text>
                        <Text>{currency(selectedBargain.paystackFeeAtCheckout)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={mutedColor}>Caution fee</Text>
                        <Text>{currency(selectedBargain.cautionFeeAtCheckout)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={mutedColor}>Total payable</Text>
                        <Text fontWeight="bold">{currency(selectedBargain.totalPayableAtCheckout)}</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </SimpleGrid>

                <Box border={`1px solid ${borderColor}`} borderRadius="lg" p={4}>
                  <Text fontWeight="bold" mb={3}>Latest message</Text>
                  <Textarea value={selectedBargain.message || 'No latest message'} isReadOnly minH="100px" />
                </Box>

                <Box border={`1px solid ${borderColor}`} borderRadius="lg" p={4}>
                  <Text fontWeight="bold" mb={3}>Negotiation history</Text>
                  <VStack align="stretch" spacing={3} maxH="320px" overflowY="auto">
                    {(selectedBargain.history || []).map((entry, index) => (
                      <Box key={`${entry.createdAt}-${index}`} bg={historyBg} borderRadius="md" p={3}>
                        <HStack justify="space-between" align="start" mb={2}>
                          <Badge colorScheme={getHistorySenderColor(entry.senderType)}>{entry.senderType}</Badge>
                          <Text fontSize="xs" color={mutedColor}>{formatDateTime(entry.createdAt)}</Text>
                        </HStack>
                        <Text fontWeight="semibold" mb={1}>Offer: {currency(entry.offeredTotalPrice)}</Text>
                        <Text fontSize="sm">{entry.message || 'No message added.'}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BargainsIndex;
