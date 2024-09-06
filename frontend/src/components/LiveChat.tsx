import { FC, useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Avatar,
  Text,
  Textarea,
  IconButton,
  Button,
  useMediaQuery,
  Spinner,
  VStack,
  AvatarBadge,
  Fade,
  useColorModeValue,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpRightAndDownLeftFromCenter,
  faDownLeftAndUpRightToCenter,
  faPaperPlane,
  faSmile,
  faPaperclip,
  faFilePdf,
  faFileImage,
} from "@fortawesome/free-solid-svg-icons";
import { createPortal } from "react-dom";
import { ChatMsg } from "../models/chatMsg.model";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { emojis } from "../utils/emojis";
import { MimeType } from "../utils/mimeTypes";
import { Colors } from "../utils/colorsConstants";
import "../assets/App.css";
import useCreateLiveChat from "../hooks/useCreateLiveChat";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import useCreateChatMessage from "../hooks/useCreateChatMessage";
import { useSubscription } from "@apollo/client";
import {
  NEW_MESSAGE_SUBSCRIPTION,
  PADULLA_ENTERED_LIVE_CHAT_SUBSCRIPTION,
} from "../utils/wolverineSubscriptions";
import useUserLeaveChat from "../hooks/useUserLeaveChat";

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveChat: FC<LiveChatProps> = ({ isOpen, onClose }) => {
  const [isLargerThan650] = useMediaQuery("(min-width: 650px)");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingPadulla, setIsLoadingPadulla] = useState(true);
  const [padullaUsername, setPadullaUsername] = useState<string>("");
  const [padullaProfilePic, setPadullaProfilePic] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const bgColor = useColorModeValue("white", Colors.color5);
  const msgBgColor1 = useColorModeValue("pink.200", "pink.700");
  const msgBgColor2 = useColorModeValue("gray.200", "gray.500");

  const { isLoadingChat, handleCreateChat } = useCreateLiveChat();
  const { isLoading, handleCreateChatMessage } = useCreateChatMessage();
  const { handleLeaveChat } = useUserLeaveChat();
  const authUser = useAuthStore((state) => state.user);
  const chats = useChatStore((state) => state.chats);
  const createMessage = useChatStore((state) => state.createMessage);
  const [chatId, setChatId] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.currentTarget.value);
    setCursorPosition(e.target.selectionStart);
  };
  const handleCursorClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };
  const addEmoji = (emoji: string) => {
    const textBeforeCursor = inputValue.substring(0, cursorPosition);
    const textAfterCursor = inputValue.substring(cursorPosition);
    setInputValue(textBeforeCursor + emoji + textAfterCursor);
    setCursorPosition(cursorPosition + emoji.length);
  };

  const {
    data: messageData,
    // loading: messageLoading,
    error: messageError,
  } = useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { liveChatId: chatId },
    skip: !chatId,
  });

  const {
    data: padullaData,
    // loading: padullaLoading,
    error: padullaError,
  } = useSubscription(PADULLA_ENTERED_LIVE_CHAT_SUBSCRIPTION, {
    variables: { liveChatId: chatId },
    skip: !chatId,
  });

  useEffect(() => {
    if (isOpen) {
      const createChatAndSetData = async () => {
        await handleCreateChat();
      };

      createChatAndSetData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chats.length > 0) {
      const newChat = chats[0];
      setMessages(newChat.messages);
      setChatId(newChat.id);
      if (newChat.users.length > 1) {
        const padulla = newChat.users.find((user) => user.id !== authUser?.id);
        setPadullaProfilePic(padulla?.profilePic || "");
        setPadullaUsername(padulla?.username || "");
        setIsLoadingPadulla(false);
      }
    }
  }, [chats]);

  useEffect(() => {
    if (messageData?.newMessage) {
      console.log("received message", messageData, messageError);
      const newMessage = {
        id: messageData?.newMessage.id,
        userId: messageData?.newMessage.user.id,
        username: messageData?.newMessage.user.username,
        content: messageData?.newMessage.content,
        seen: messageData?.newMessage.seen,
        createdAt: messageData?.newMessage.createdAt,
      };
      createMessage(newMessage, chatId);
    }
  }, [messageData]);

  useEffect(() => {
    console.log("padulla trying to join...", padullaData, padullaError);
    if (padullaData?.padullaEnteredLiveChat) {
      setIsLoadingPadulla(false);
      setPadullaProfilePic(padullaData.padullaEnteredLiveChat.profilePic);
      setPadullaUsername(padullaData.padullaEnteredLiveChat.username);
    }
  }, [padullaData]);

  const onExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const onSendMessage = async () => {
    if (!(inputValue.trim() === "" || inputValue.length > 200)) {
      await handleCreateChatMessage({ chatId, content: inputValue });
      setInputValue("");
    }
  };

  const onFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && Object.values(MimeType).includes(file.type)) {
      setSelectedFile(file);
    }
  };

  const onLeaveChat = async () => {
    console.log("leaving chat");
    await handleLeaveChat(chatId);
    onClose();
  };

  const chat = (
    <Fade in={isOpen} className="live-chat">
      <Box
        position="fixed"
        right={isLargerThan650 ? "1rem" : "0"}
        bottom="1rem"
        top={isLargerThan650 ? "unset" : isExpanded ? "10vh" : "unset"}
        width={
          isLargerThan650
            ? isExpanded
              ? "450px"
              : "300px"
            : isExpanded
            ? "100%"
            : "300px"
        }
        height={
          isLargerThan650
            ? isExpanded
              ? "600px"
              : "400px"
            : isExpanded
            ? "90vh"
            : "400px"
        }
        bg={`${bgColor}`}
        boxShadow="0 0 10px rgba(0, 0, 0, 0.35)"
        borderRadius={isLargerThan650 ? "10px" : isExpanded ? "0" : "10px"}
        zIndex={4}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Flex
          align="center"
          justify="space-between"
          p="3"
          pb="2"
          borderBottom="2px solid var(--secondary-color)"
        >
          {isLoadingPadulla ? (
            <Flex align="center">
              <Spinner
                thickness="2px"
                speed="0.65s"
                emptyColor="gray.200"
                color="var(--secondary-color)"
                size="lg"
              />
              <Text ml="2" fontStyle={"italic"}>
                Loading...
              </Text>
            </Flex>
          ) : (
            <Flex align="center">
              <Avatar size="sm" name={padullaUsername} src={padullaProfilePic}>
                <AvatarBadge boxSize="1.25em" bg="green.500" />
              </Avatar>
              <Text ml="2">{padullaUsername}</Text>
            </Flex>
          )}

          <Flex>
            <IconButton
              aria-label="Expand"
              variant="ghost"
              icon={
                isExpanded ? (
                  <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} />
                ) : (
                  <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
                )
              }
              onClick={onExpand}
            />

            <IconButton
              ml="1"
              variant="ghost"
              aria-label="Close"
              icon={<SmallCloseIcon />}
              onClick={() => {
                onLeaveChat();
              }}
            />
          </Flex>
        </Flex>
        <Flex
          className="msg-box"
          direction="column"
          overflowY="auto"
          px="3"
          py="2"
          flex="1"
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              bg={
                msg.userId === authUser?.id
                  ? `${msgBgColor1}`
                  : `${msgBgColor2}`
              }
              alignSelf={
                msg.userId === authUser?.id ? "flex-start" : "flex-end"
              }
              borderRadius="lg"
              p="2"
              mt="2"
              maxW="80%"
            >
              <Text>{`${msg.content}`}</Text>
            </Box>
          ))}
        </Flex>
        <Flex
          as="footer"
          pt="3"
          pb="2"
          pr="2"
          pl="2"
          borderTop="2px solid var(--secondary-color)"
        >
          <VStack w="100%">
            <Textarea
              ref={textAreaRef}
              isDisabled={isLoadingChat}
              placeholder="Type a message"
              variant="filled"
              flex="1"
              ml="2"
              mr="2"
              minH="60px"
              resize="none"
              _focus={{
                borderColor: "var(--secondary-color)",
              }}
              value={inputValue}
              className="msg-box"
              onChange={handleTextChange}
              onClick={handleCursorClick}
            />
            <Flex justify="space-between" width="100%">
              <Flex>
                <IconButton
                  aria-label="Emoji"
                  isDisabled={isLoadingChat}
                  variant="ghost"
                  icon={<FontAwesomeIcon icon={faSmile} />}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={onFileChange}
                />
                <IconButton
                  aria-label="Attach file"
                  variant="ghost"
                  icon={<FontAwesomeIcon icon={faPaperclip} />}
                  ml="2"
                  onClick={onFileButtonClick}
                />
                {selectedFile && (
                  <IconButton
                    aria-label="Added file"
                    variant="ghost"
                    icon={
                      selectedFile.type === MimeType.PDF ? (
                        <FontAwesomeIcon icon={faFilePdf} />
                      ) : (
                        <FontAwesomeIcon icon={faFileImage} />
                      )
                    }
                    ml="2"
                    onClick={() => setSelectedFile(null)}
                  />
                )}
                {showEmojiPicker ? (
                  <Box
                    position="absolute"
                    bottom="60px"
                    right="0"
                    zIndex="10"
                    p={2}
                    bg={`${bgColor}`}
                    boxShadow="lg"
                    borderRadius="md"
                  >
                    <Flex wrap="wrap">
                      {emojis.map((emoji) => (
                        <Button
                          key={emoji}
                          onClick={() => addEmoji(emoji)}
                          variant="ghost"
                          p={1}
                          fontSize="20px"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </Flex>
                  </Box>
                ) : null}
              </Flex>
              <Flex>
                <Text
                  mt={2}
                  mr={0}
                  color={inputValue.length > 200 ? "red" : ""}
                >{`${inputValue.length}/200`}</Text>
                <Button
                  aria-label="Send"
                  variant="ghost"
                  leftIcon={<FontAwesomeIcon icon={faPaperPlane} />}
                  ml="2"
                  isLoading={isLoading}
                  isDisabled={isLoadingChat}
                  onClick={() => {
                    if (authUser) onSendMessage();
                  }}
                >
                  Send
                </Button>
              </Flex>
            </Flex>
          </VStack>
        </Flex>
      </Box>
    </Fade>
  );

  return createPortal(chat, document.body);
};

export default LiveChat;
