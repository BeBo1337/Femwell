import { useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import { SET_MESSAGE_SEEN_MUTATION } from "../utils/wolverineRequests";
import axios from "axios";
import { print } from "graphql";
import useChatStore from "../store/chatStore";

const useSetMessagesSeen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const setSeen = useChatStore((state) => state.setMsgSeen);
  const showToast = useShowToast();

  const handleSetMessageSeen = async (liveChatId: number) => {
    if (isLoading) return;
    if (liveChatId && authUser) {
      setIsLoading(true);

      try {
        console.log("Setting messages seen");
        const setMessageSeenResponse = await axios.post(
          `${import.meta.env.VITE_WOLVERINE_ENDPOINT}/graphql`,
          {
            query: print(SET_MESSAGE_SEEN_MUTATION),
            variables: { liveChatId },
          },
          {
            headers: {
              authorization: authUser.jwt,
            },
          },
        );
        const setMessageSeenResult = await setMessageSeenResponse.data;
        console.log("setMessageSeenResult", setMessageSeenResult);
        console.log("--------------------");

        if (setMessageSeenResult) {
          setIsLoading(false);
          return true;
        }

        return false;
      } catch (error: any) {
        showToast("Error", "Error in set messages seen", "error");
        setIsLoading(false);
        return false;
      }
    }
  };

  return { isLoading, handleSetMessageSeen };
};

export default useSetMessagesSeen;
