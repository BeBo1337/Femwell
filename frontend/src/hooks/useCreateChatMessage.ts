import { useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
// import useChatStore from "../store/chatStore";
import {
  SEND_MESSAGE_MUTATION,
  SendMessageInput,
} from "../utils/wolverineRequests";
import axios from "axios";
import { print } from "graphql";

const useCreateChatMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  // const createMessage = useChatStore((state) => state.createMessage);
  // const chats = useChatStore((state) => state.chats);
  const showToast = useShowToast();

  const handleCreateChatMessage = async (data: any) => {
    if (isLoading) return;
    console.log(data);
    if (data.chatId && data.content.length > 0 && authUser) {
      setIsLoading(true);

      try {
        const sendMessageInput: SendMessageInput = {
          userId: authUser.id,
          liveChatId: data.chatId,
          content: data.content,
        };
        console.log("sendMessageInput", sendMessageInput);
        const createMessageResponse = await axios.post(
          `${import.meta.env.VITE_WOLVERINE_ENDPOINT}/graphql`,
          {
            query: print(SEND_MESSAGE_MUTATION),
            variables: { sendMessageInput },
          },
          {
            headers: {
              authorization: authUser.jwt,
            },
          },
        );
        const createMessageResult = await createMessageResponse.data.data
          .sendMessage;
        console.log("createMessageResult", createMessageResult);
        console.log("--------------------");
        if (createMessageResult) {
          setIsLoading(false);
          return true;
        }

        return false;
      } catch (error: any) {
        showToast(
          "Error",
          "Please Login to use this feature",
          "error",
          "NotLogged",
        );
        setIsLoading(false);
        return false;
      }
    }
  };

  return { isLoading, handleCreateChatMessage };
};

export default useCreateChatMessage;
