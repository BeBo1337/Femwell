import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Tabs,
  useMediaQuery,
  Avatar,
  Skeleton,
  useColorModeValue,
  AvatarBadge,
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import useAuthStore from "../store/authStore";

import ChatInterface from "../components/ChatInterface";
import { AvatarProps } from "../models/avatarProps.model";
import useChatStore from "../store/chatStore";
import useGetLiveChats from "../hooks/useGetLiveChats";
import useCreateChatMessage from "../hooks/useCreateChatMessage";
import usePadullaJoinChat from "../hooks/usePadullaJoinChat";
import useSetMessagesSeen from "../hooks/useSetMessagesSeen";

const LiveChatCenter: FC<{}> = () => {
  const [isLargerThan650] = useMediaQuery("(min-width: 650px)");
  const [isLargerThan930] = useMediaQuery("(min-width: 930px)");

  const [tabIndex, setTabIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [avatars, setAvatars] = useState<AvatarProps[]>([
    { username: "a" },
    { username: "b" },
    { username: "c" },
    { username: "d" },
    { username: "e" },
    { username: "f" },
    { username: "g" },
    { username: "h" },
    { username: "i" },
    { username: "j" },
  ]);

  const authUser = useAuthStore((state) => state.user);
  const { handleGetChats } = useGetLiveChats();
  const { handleJoinChat } = usePadullaJoinChat();
  const { handleCreateChatMessage } = useCreateChatMessage();
  const { handleSetMessageSeen } = useSetMessagesSeen();
  const chats = useChatStore((state) => state.chats);

  const panelBackgoundColor = useColorModeValue("white", "#533142");

  const [isLoading, setIsLoading] = useState(true);

  const handleSelectUser = async (username: string, chatId: number) => {
    addPadullaToChat(chatId);
    console.log("new selected user", username);
    setSelectedUser(username);
    handleSeenMsg(chatId, "Seen");
    const newTabIndex = avatars.findIndex(
      (avatar) => avatar.username === username,
    );
    setTabIndex(newTabIndex);
  };

  const addPadullaToChat = async (chatId: number) => {
    const chat = chats.find((chat) => chat.id === chatId);
    if (chat) {
      console.log(!chat.users.some((user) => user.id === authUser?.id));
      if (!chat.users.some((user) => user.id === authUser?.id)) {
        await handleJoinChat(chatId);
      }
    }
  };

  const handleSeenMsg = async (chatId: number, status: string) => {
    console.log(chatId);
    if (status === "Seen") {
      await handleSetMessageSeen(chatId);
    }
    const i = chats.findIndex((chat) => chat.id == chatId);
    if (i !== -1) {
      const updatedAvatars = [...avatars];
      status === "Seen"
        ? (updatedAvatars[i].msgSeen = true)
        : status === "Unseen"
        ? (updatedAvatars[i].msgSeen = false)
        : null;
      console.log(updatedAvatars);
      setAvatars(updatedAvatars);
    }
  };

  const handleUserLeft = async (chatId: number) => {
    const i = chats.findIndex((chat) => chat.id == chatId);
    if (i !== -1) {
      const updatedAvatars = [...avatars];
      updatedAvatars[i].userConnected = false;
      setAvatars(updatedAvatars);
    }
  };

  const addMessage = async (data: any) => {
    await handleCreateChatMessage(data);
  };

  useEffect(() => {
    const fetchChats = async () => {
      await handleGetChats();
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (chats.length > 0 && authUser) {
      const newAvatars: AvatarProps[] = chats.map((chat, index) => {
        const user = chat.users.find((user) => user.id !== authUser.id);
        console.log(chat.id, chat.messages[chat.messages.length - 1]?.seen);
        return {
          username: user ? user.username : "NA",
          profilePic: user ? user.profilePic : "",
          userConnected: true,
          msgSeen:
            index === tabIndex
              ? true
              : chat.messages[chat.messages.length - 1]?.seen,
        };
      });
      console.log("selected user", selectedUser);
      console.log("tabIndex", tabIndex);
      console.log("newAvatars", newAvatars);
      setAvatars(newAvatars);

      setSelectedUser(avatars[0].username);
      addPadullaToChat(chats[0].id);
    }

    setIsLoading(false);
  }, [chats]);

  return (
    <div className="page">
      <Box
        p={isLargerThan650 ? 5 : 3}
        maxWidth={isLargerThan930 ? "1400px" : "100%"}
        mx="auto"
      >
        <Skeleton fadeDuration={1} isLoaded={!isLoading}>
          <Tabs
            orientation={isLargerThan650 ? "vertical" : "horizontal"}
            ml={isLargerThan930 ? 20 : isLargerThan650 ? 6 : ""}
            mr={isLargerThan930 ? 20 : isLargerThan650 ? 6 : ""}
            width={isLargerThan650 ? "" : "100%"}
            colorScheme="green"
            index={tabIndex}
            onChange={(index) => {
              const chat = chats[index];
              const avatar = avatars[index];
              handleSelectUser(avatar.username, chat.id);
            }}
          >
            <TabList
              hidden={!isLargerThan650}
              justifyContent={isLargerThan650 ? "start" : "center"}
              bgColor={panelBackgoundColor}
              borderRadius={5}
              whiteSpace={isLargerThan650 ? "nowrap" : "normal"}
              minWidth={"200px"}
            >
              {chats.map((chat, index) => (
                <Tab py={4} key={chat.id} justifyContent={"flex-start"} px={2}>
                  <Box position="relative" display="inline-block">
                    <Avatar
                      size={"sm"}
                      name={avatars[index]?.username || ""}
                      mr={2}
                      src={avatars[index]?.profilePic || ""}
                    >
                      <AvatarBadge
                        boxSize="1.25em"
                        bg={
                          avatars[index]?.userConnected
                            ? "green.500"
                            : "gray.500"
                        }
                      />
                    </Avatar>
                    {/* {avatars[index]?.msgSeen === false && (
                      <Box position="absolute" top="-2" right="0">
                        <FontAwesomeIcon icon={faMessage} color="crimson" />
                      </Box>
                    )} */}
                  </Box>
                  <Text>{`Chat with ${avatars[index]?.username}`}</Text>
                </Tab>
              ))}
            </TabList>

            <TabPanels
              ml={isLargerThan650 ? 5 : 0}
              bgColor={panelBackgoundColor}
              borderRadius={5}
              minHeight={isLargerThan650 ? "85vh" : "100vh"}
            >
              {chats.length <= 0 && !isLoading ? (
                <TabPanel>
                  <Text fontWeight={"bold"} fontSize={"2xl"}>
                    No Open Chats Available
                  </Text>
                </TabPanel>
              ) : (
                chats.map((chat, index) => (
                  <TabPanel
                    key={chat.id}
                    display={"flex"}
                    h={"100%"}
                    position={"relative"}
                  >
                    <ChatInterface
                      chat={chat}
                      user={avatars[index]?.username || "Bug"}
                      profilePic={avatars[index]?.profilePic || ""}
                      avatars={avatars}
                      selectedUser={selectedUser}
                      handleSelectUser={handleSelectUser}
                      handleUserLeft={handleUserLeft}
                      handleSeenMsg={handleSeenMsg}
                      addMessage={addMessage}
                    />
                  </TabPanel>
                ))
              )}
            </TabPanels>
          </Tabs>
        </Skeleton>
      </Box>
    </div>
  );
};

export default LiveChatCenter;
