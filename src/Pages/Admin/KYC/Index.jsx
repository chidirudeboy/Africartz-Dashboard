import { Fragment, useState, useEffect, useContext, useCallback } from "react";
import { 
  Flex, SimpleGrid, Spinner, Text, useToast, Box, Badge, HStack, VStack, 
  Input, InputGroup, InputLeftElement, Button, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Textarea, FormControl, 
  FormLabel, useDisclosure, Select, Table, Thead, Tbody, Tr, Th, Td, Tfoot,
  Alert, AlertIcon, AlertTitle, AlertDescription, Divider
} from "@chakra-ui/react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import axios from "axios";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader.js";
import { AdminGetKycListAPI, AdminGetAgentKycAPI, AdminApproveKycAPI, AdminRejectKycAPI } from "../../../Endpoints";
import GlobalContext from "../../../Context";
import { SearchIcon } from "@chakra-ui/icons";

const KycManagement = () => {
  const [loading, setLoading] = useState(false);
  const [kycList, setKycList] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedAgentKyc, setSelectedAgentKyc] = useState(null);
  const [kycDetailLoading, setKycDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const toast = useToast();
  const { handleTokenExpired } = useContext(GlobalContext);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();

  const fetchKycList = useCallback(async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("No authentication token found");

      const url = statusFilter && statusFilter !== "all" 
        ? `${AdminGetKycListAPI}?status=${statusFilter}` 
        : AdminGetKycListAPI;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        }
      });

      if (response.data.success) {
        setKycList(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch KYC list");
      }
    } catch (error) {
      console.error("Error fetching KYC list:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      if (error.response?.status === 401) {
        handleTokenExpired();
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, handleTokenExpired, toast]);

  useEffect(() => {
    fetchKycList();
  }, [fetchKycList]);

  const viewKycDetails = async (agentId) => {
    setKycDetailLoading(true);
    setSelectedAgentKyc(null);
    onDetailOpen();
    
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.get(AdminGetAgentKycAPI(agentId), {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        }
      });

      if (response.data.success) {
        setSelectedAgentKyc(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch KYC details");
      }
    } catch (error) {
      console.error("Error fetching KYC details:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      onDetailClose();
    } finally {
      setKycDetailLoading(false);
    }
  };

  const approveKyc = async () => {
    if (!selectedAgentKyc) return;
    setActionLoading(true);
    
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.post(
        AdminApproveKycAPI(selectedAgentKyc.agentId),
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "KYC approved successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onDetailClose();
        fetchKycList();
      } else {
        throw new Error(response.data.message || "Failed to approve KYC");
      }
    } catch (error) {
      console.error("Error approving KYC:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = () => {
    onDetailClose();
    onRejectOpen();
  };

  const rejectKyc = async () => {
    if (!selectedAgentKyc || !rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setActionLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.post(
        AdminRejectKycAPI(selectedAgentKyc.agentId),
        { reason: rejectReason },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "KYC rejected",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setRejectReason("");
        onRejectClose();
        fetchKycList();
      } else {
        throw new Error(response.data.message || "Failed to reject KYC");
      }
    } catch (error) {
      console.error("Error rejecting KYC:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      verified: "green",
      pending: "orange",
      failed: "red",
      not_started: "gray",
      manual_review: "blue"
    };
    return <Badge colorScheme={colors[status] || "gray"}>{status?.replace("_", " ")}</Badge>;
  };

  const getVerificationBadges = (kyc) => {
    return (
      <HStack spacing={2}>
        {kyc.apiVerified && (
          <Badge colorScheme="green" variant="outline">API Verified</Badge>
        )}
        {kyc.adminVerified && (
          <Badge colorScheme="purple" variant="outline">Admin Verified</Badge>
        )}
        {!kyc.apiVerified && !kyc.adminVerified && (
          <Badge colorScheme="gray" variant="outline">Not Verified</Badge>
        )}
      </HStack>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const agentNameTemplate = (rowData) => (
    <VStack align="start" spacing={0}>
      <Text fontWeight="600">{rowData.firstName} {rowData.lastName}</Text>
      <Text fontSize="sm" color="gray.500">{rowData.email}</Text>
    </VStack>
  );

  const actionTemplate = (rowData) => (
    <Button 
      size="sm" 
      colorScheme="blue" 
      variant="outline"
      onClick={() => viewKycDetails(rowData.agentId)}
    >
      View
    </Button>
  );

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Text fontSize="xl" fontWeight="bold">KYC Verification Management</Text>
            <HStack spacing={4}>
              <Select 
                placeholder="Filter by status" 
                width="200px"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="not_started">Not Started</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="failed">Failed</option>
                <option value="manual_review">Manual Review</option>
              </Select>
              <InputGroup width="300px">
                <InputLeftElement>
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
                <Input 
                  placeholder="Search agents..." 
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </InputGroup>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Flex justify="center" align="center" minH="300px">
              <Spinner size="xl" />
            </Flex>
          ) : (
            <DataTable 
              value={kycList}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              globalFilter={globalFilter}
              emptyMessage="No KYC records found"
              sortField="submittedAt"
              sortOrder={-1}
            >
              <Column field="agentId" header="Agent" body={agentNameTemplate} sortable />
              <Column field="phone" header="Phone" />
              <Column field="status" header="Status" body={(row) => getStatusBadge(row.kyc?.status)} sortable />
              <Column header="Verification" body={(row) => getVerificationBadges(row.kyc)} />
              <Column field="kyc.submittedAt" header="Submitted" body={(row) => formatDate(row.kyc?.submittedAt)} sortable />
              <Column header="Actions" body={actionTemplate} />
            </DataTable>
          )}
        </CardBody>
      </Card>

      {/* KYC Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>KYC Verification Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {kycDetailLoading ? (
              <Flex justify="center" align="center" minH="200px">
                <Spinner size="lg" />
              </Flex>
            ) : selectedAgentKyc ? (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {selectedAgentKyc.firstName} {selectedAgentKyc.lastName}
                  </Text>
                  <Text color="gray.600">{selectedAgentKyc.email} | {selectedAgentKyc.phone}</Text>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="600" mb={2}>Verification Status</Text>
                  <HStack spacing={4}>
                    <Badge colorScheme={selectedAgentKyc.kyc?.status === 'verified' ? 'green' : 'orange'} fontSize="md" p={2}>
                      {selectedAgentKyc.kyc?.status?.replace("_", " ")}
                    </Badge>
                    {selectedAgentKyc.kyc?.apiVerified && (
                      <Badge colorScheme="green" variant="outline">API Verified</Badge>
                    )}
                    {selectedAgentKyc.kyc?.adminVerified && (
                      <Badge colorScheme="purple" variant="outline">Admin Verified</Badge>
                    )}
                  </HStack>
                </Box>

                {selectedAgentKyc.kyc?.verificationType === 'individual' ? (
                  <>
                    <Box>
                      <Text fontWeight="600" mb={2}>Individual Details</Text>
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.500">ID Type</Text>
                          <Text>{selectedAgentKyc.kyc?.identityType?.toUpperCase()}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">ID Number (Last 4)</Text>
                          <Text>****{selectedAgentKyc.kyc?.identityNumberLast4}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Verified Name</Text>
                          <Text>{selectedAgentKyc.kyc?.verificationName || "-"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Phone</Text>
                          <Text>{selectedAgentKyc.kyc?.verificationPhone || "-"}</Text>
                        </Box>
                          {selectedAgentKyc.kyc?.identityDocumentUrl && (
                            <Box>
                              <Text fontSize="sm" color="gray.500">ID Document</Text>
                              <a href={selectedAgentKyc.kyc.identityDocumentUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={selectedAgentKyc.kyc.identityDocumentUrl}
                                  alt="ID Document"
                                  style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee', marginTop: 4 }}
                                />
                              </a>
                            </Box>
                          )}
                      </SimpleGrid>
                    </Box>
                  </>
                ) : selectedAgentKyc.kyc?.verificationType === 'business' ? (
                  <>
                    <Box>
                      <Text fontWeight="600" mb={2}>Business Details</Text>
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Business Name</Text>
                          <Text>{selectedAgentKyc.kyc?.businessName || "-"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">CAC/RC Number</Text>
                          <Text>{selectedAgentKyc.kyc?.businessRegistrationNumber || "-"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Director Name</Text>
                          <Text>{selectedAgentKyc.kyc?.directorName || "-"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Director Phone</Text>
                          <Text>{selectedAgentKyc.kyc?.directorPhone || "-"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Business Address</Text>
                          <Text>{selectedAgentKyc.kyc?.businessAddress || "-"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">State/LGA</Text>
                          <Text>{selectedAgentKyc.kyc?.businessState}{selectedAgentKyc.kyc?.businessLga ? `, ${selectedAgentKyc.kyc.businessLGA}` : ''}</Text>
                        </Box>
                          {selectedAgentKyc.kyc?.cacDocumentUrl && (
                            <Box>
                              <Text fontSize="sm" color="gray.500">CAC Document</Text>
                              <a href={selectedAgentKyc.kyc.cacDocumentUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={selectedAgentKyc.kyc.cacDocumentUrl}
                                  alt="CAC Document"
                                  style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee', marginTop: 4 }}
                                />
                              </a>
                            </Box>
                          )}
                      </SimpleGrid>
                    </Box>
                  </>
                ) : null}

                <Divider />

                <Box>
                  <Text fontWeight="600" mb={2}>Verification Timeline</Text>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Submitted</Text>
                      <Text>{formatDate(selectedAgentKyc.kyc?.submittedAt)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">API Verified At</Text>
                      <Text>{selectedAgentKyc.kyc?.apiVerifiedAt ? formatDate(selectedAgentKyc.kyc?.apiVerifiedAt) : "-"}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Admin Verified At</Text>
                      <Text>{selectedAgentKyc.kyc?.adminVerifiedAt ? formatDate(selectedAgentKyc.kyc?.adminVerifiedAt) : "-"}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {selectedAgentKyc.kyc?.failureReason && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Verification Failed</AlertTitle>
                      <AlertDescription>{selectedAgentKyc.kyc.failureReason}</AlertDescription>
                    </Box>
                  </Alert>
                )}

                {selectedAgentKyc.kyc?.manualReviewReason && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Manual Review Note</AlertTitle>
                      <AlertDescription>{selectedAgentKyc.kyc.manualReviewReason}</AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            ) : (
              <Text>No details available</Text>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedAgentKyc && selectedAgentKyc.kyc?.status !== 'verified' && (
              <>
                <Button 
                  colorScheme="green" 
                  mr={3} 
                  onClick={approveKyc}
                  isLoading={actionLoading}
                >
                  Approve KYC
                </Button>
                <Button 
                  colorScheme="red" 
                  variant="outline" 
                  onClick={openRejectModal}
                >
                  Reject
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={onDetailClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject KYC Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Rejection Reason</FormLabel>
              <Textarea 
                placeholder="Enter reason for rejection (min 10 characters)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="red" 
              onClick={rejectKyc}
              isLoading={actionLoading}
              isDisabled={rejectReason.trim().length < 10}
            >
              Confirm Rejection
            </Button>
            <Button variant="ghost" onClick={onRejectClose} ml={3}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Fragment>
  );
};

export default KycManagement;