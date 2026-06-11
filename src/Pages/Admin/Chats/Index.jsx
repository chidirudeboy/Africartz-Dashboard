import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Select,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';
import { AdminGetAllChatsAPI, AdminGetChatMessagesAPI } from '../../../Endpoints';

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

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'green';
    case 'closed':
      return 'red';
    case 'archived':
      return 'gray';
    default:
      return 'gray';
  }
};

const getSenderColor = (senderType) => {
  switch (senderType) {
    case 'user':
      return 'blue';
    case 'agent':
      return 'orange';
    case 'delegate':
      return 'purple';
    case 'system':
      return 'gray';
    default:
      return 'gray';
  }
};

const ChatsIndex = () => {
  const toast = useToast();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    chatType: '',
    search: ''
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const threadBg = useColorModeValue('gray.50', 'gray.900');

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      const response = await axios.get(AdminGetAllChatsAPI, {
        headers: authHeaders,
        params: {
          page: 1,
          limit: 50,
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.chatType ? { chatType: filters.chatType } : {}),
          ...(filters.search ? { search: filters.search } : {})
        }
      });

      const nextChats = response?.data?.data?.chats || [];
      setChats(nextChats);

      if (nextChats.length === 0) {
        setSelectedChatId('');
        setSelectedChat(null);
        setMessages([]);
        return;
      }

      setSelectedChatId((currentId) => {
        const stillExists = nextChats.some((chat) => chat._id === currentId || chat.id === currentId);
        return stillExists ? currentId : (nextChats[0]._id || nextChats[0].id || '');
      });
    } catch (error) {
      toast({
        title: 'Failed to load chats',
        description: error?.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoadingChats(false);
    }
  }, [authHeaders, filters, toast]);

  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId) return;

    try {
      setLoadingMessages(true);
      const response = await axios.get(AdminGetChatMessagesAPI(chatId), {
        headers: authHeaders,
        params: { page: 1, limit: 200 }
      });

      setSelectedChat(response?.data?.data?.chat || null);
      setMessages(response?.data?.data?.messages || []);
    } catch (error) {
      setSelectedChat(null);
      setMessages([]);
      toast({
        title: 'Failed to load messages',
        description: error?.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [authHeaders, toast]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    }
  }, [fetchMessages, selectedChatId]);

  const activeSession = selectedChat || chats.find((chat) => (chat._id || chat.id) === selectedChatId) || null;

  return (
    <Box p={6} pt={20}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Chat Sessions
          </Text>
          <Text color={mutedColor}>
            Admin view for all agent and user chats across bookings, reservations, and inquiries.
          </Text>
        </Box>

        <Box bg={cardBg} borderRadius="lg" border={`1px solid ${borderColor}`} p={4}>
          <Flex gap={3} wrap="wrap">
            <Input
              placeholder="Search property or booking ref"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              maxW="320px"
            />
            <Select
              placeholder="All statuses"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              maxW="180px"
            >
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </Select>
            <Select
              placeholder="All chat types"
              value={filters.chatType}
              onChange={(e) => setFilters((prev) => ({ ...prev, chatType: e.target.value }))}
              maxW="180px"
            >
              <option value="booking">Booking</option>
              <option value="inquiry">Inquiry</option>
              <option value="support">Support</option>
            </Select>
            <Button colorScheme="blue" onClick={fetchChats}>Refresh</Button>
          </Flex>
        </Box>

        <Flex gap={6} align="stretch" direction={{ base: 'column', xl: 'row' }}>
          <Box
            w={{ base: '100%', xl: '380px' }}
            bg={cardBg}
            borderRadius="lg"
            border={`1px solid ${borderColor}`}
            overflow="hidden"
          >
            <Box px={4} py={3} borderBottom={`1px solid ${borderColor}`}>
              <Text fontWeight="bold">All Sessions</Text>
              <Text fontSize="sm" color={mutedColor}>{chats.length} loaded</Text>
            </Box>
            <Box maxH="70vh" overflowY="auto">
              {loadingChats ? (
                <Flex justify="center" py={10}><Spinner /></Flex>
              ) : chats.length === 0 ? (
                <Box p={4}><Text color={mutedColor}>No chat sessions found.</Text></Box>
              ) : (
                chats.map((chat) => {
                  const chatId = chat._id || chat.id;
                  const isActive = chatId === selectedChatId;
                  return (
                    <Box
                      key={chatId}
                      px={4}
                      py={3}
                      cursor="pointer"
                      borderBottom={`1px solid ${borderColor}`}
                      bg={isActive ? 'blue.50' : 'transparent'}
                      onClick={() => setSelectedChatId(chatId)}
                    >
                      <HStack justify="space-between" align="start" mb={2}>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="semibold" fontSize="sm">{chat.metadata?.propertyName || 'Untitled chat'}</Text>
                          <Text fontSize="xs" color={mutedColor}>{chat.chatType || 'chat'}</Text>
                        </VStack>
                        <Badge colorScheme={getStatusColor(chat.status)}>{chat.status || 'unknown'}</Badge>
                      </HStack>
                      <Text fontSize="sm" noOfLines={1} mb={1}>
                        {chat.userParticipant?.name || 'Unknown user'} <Text as="span" color={mutedColor}>vs</Text> {chat.agentParticipant?.name || 'Unknown agent'}
                      </Text>
                      <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                        {chat.lastMessage?.content || 'No messages yet'}
                      </Text>
                      <HStack justify="space-between" mt={2}>
                        <Text fontSize="xs" color={mutedColor}>
                          {chat.metadata?.bookingRef || chat.metadata?.reservationRef || 'No reference'}
                        </Text>
                        <Text fontSize="xs" color={mutedColor}>
                          {formatDateTime(chat.lastActivityAt)}
                        </Text>
                      </HStack>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>

          <Box
            flex="1"
            bg={cardBg}
            borderRadius="lg"
            border={`1px solid ${borderColor}`}
            overflow="hidden"
          >
            <Box px={5} py={4} borderBottom={`1px solid ${borderColor}`}>
              {activeSession ? (
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" w="100%">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">{activeSession.metadata?.propertyName || 'Chat thread'}</Text>
                      <Text fontSize="sm" color={mutedColor}>
                        {activeSession.userParticipant?.name || 'Unknown user'} and {activeSession.agentParticipant?.name || 'Unknown agent'}
                      </Text>
                    </VStack>
                    <Badge colorScheme={getStatusColor(activeSession.status)}>{activeSession.status || 'unknown'}</Badge>
                  </HStack>
                  <HStack spacing={4} flexWrap="wrap">
                    <Text fontSize="sm" color={mutedColor}>Type: {activeSession.chatType || 'N/A'}</Text>
                    <Text fontSize="sm" color={mutedColor}>Ref: {activeSession.metadata?.bookingRef || activeSession.metadata?.reservationRef || 'N/A'}</Text>
                    <Text fontSize="sm" color={mutedColor}>Check-in: {formatDateTime(activeSession.metadata?.checkInDate)}</Text>
                    <Text fontSize="sm" color={mutedColor}>Check-out: {formatDateTime(activeSession.metadata?.checkOutDate)}</Text>
                  </HStack>
                </VStack>
              ) : (
                <Text fontWeight="bold">Select a chat session</Text>
              )}
            </Box>

            <Box bg={threadBg} minH="70vh" maxH="70vh" overflowY="auto" px={5} py={4}>
              {loadingMessages ? (
                <Flex justify="center" py={10}><Spinner /></Flex>
              ) : !activeSession ? (
                <Flex justify="center" align="center" h="100%">
                  <Text color={mutedColor}>Choose a chat session to view messages.</Text>
                </Flex>
              ) : messages.length === 0 ? (
                <Flex justify="center" align="center" h="100%">
                  <Text color={mutedColor}>No messages in this chat yet.</Text>
                </Flex>
              ) : (
                <VStack spacing={4} align="stretch">
                  {messages.map((message) => (
                    <Box
                      key={message._id || `${message.senderId}-${message.createdAt}`}
                      alignSelf={message.senderType === 'system' ? 'center' : 'stretch'}
                    >
                      <Box
                        bg={message.senderType === 'system' ? 'gray.200' : 'white'}
                        border={`1px solid ${borderColor}`}
                        borderRadius="lg"
                        px={4}
                        py={3}
                        maxW={message.senderType === 'system' ? '100%' : '85%'}
                        ml={message.senderType === 'agent' || message.senderType === 'delegate' ? 'auto' : '0'}
                      >
                        <HStack justify="space-between" mb={2} align="start">
                          <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="semibold">{message.senderName || message.senderType}</Text>
                            <Badge colorScheme={getSenderColor(message.senderType)}>{message.senderType}</Badge>
                          </HStack>
                          <Text fontSize="xs" color={mutedColor}>{formatDateTime(message.createdAt)}</Text>
                        </HStack>
                        <Text whiteSpace="pre-wrap" fontSize="sm">{message.content}</Text>
                      </Box>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
};

export default ChatsIndex;
