import { useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import { CREATE_LIVE_CHAT_MUTATION } from "../utils/wolverineRequests";
import axios from "axios";
import { print } from "graphql";
import useChatStore from "../store/chatStore";

const useCreateLiveChat = () => {
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const createChat = useChatStore((state) => state.createChat);
  const chats = useChatStore((state) => state.chats);

  const showToast = useShowToast();

  const handleCreateChat = async () => {
    if (isLoadingChat || chats.length > 0) return;

    if (authUser) {
      setIsLoadingChat(true);
      try {
        const createChatResponse = await axios.post(
          `${import.meta.env.VITE_WOLVERINE_ENDPOINT}/graphql`,
          {
            query: print(CREATE_LIVE_CHAT_MUTATION),
            variables: { userId: authUser.id },
          },
          {
            headers: {
              authorization: authUser.jwt,
            },
          },
        );

        const createChatResult = await createChatResponse.data.data
          .createLiveChat;
        console.log("createChatResult", createChatResult);
        console.log("--------------------");

        const newChat = {
          id: createChatResult.id,
          users: createChatResult.users,
          messages: createChatResult.messages || [],
          createdAt: createChatResult.createdAt,
          updatedAt: createChatResult.updatedAt,
        };

        console.log("newChat", newChat);

        createChat(newChat);

        setIsLoadingChat(false);
        showToast("Success", "Chat created successfully", "success");
      } catch (error: any) {
        showToast("Error", error.message, "error");
        setIsLoadingChat(false);
      }
    }
  };

  return { isLoadingChat, handleCreateChat };
};

export default useCreateLiveChat;
