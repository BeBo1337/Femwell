import { useState } from "react";
import useAuthStore from "../store/authStore";
import axios from "axios";
import { print } from "graphql";
import {
  UPDATE_USER_MUTATION,
  UpdateUserInput,
} from "../utils/wolverineRequests";

const useUpdateLaterArticles = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setUser);

  const editLaterArticles = async (articleId: string) => {
    if (isUpdating || !authUser || !articleId) return false;
    setIsUpdating(true);

    try {
      let updatedLaterArticles;
      if (authUser.readLater?.includes(articleId))
        updatedLaterArticles = authUser.readLater.filter(
          (id) => id !== articleId,
        );
      else updatedLaterArticles = [...(authUser.readLater || []), articleId];

      let updateUserInput: UpdateUserInput = {
        id: authUser.id,
        username: authUser.username,
        readLater: updatedLaterArticles,
      };

      console.log("updateUserInput", updateUserInput);
      const updateUserResponse = await axios.post(
        `${import.meta.env.VITE_WOLVERINE_ENDPOINT}/graphql`,
        {
          query: print(UPDATE_USER_MUTATION),
          variables: { updateUserInput },
        },
        {
          headers: {
            authorization: authUser.jwt,
          },
        },
      );

      const updateUserResult = await updateUserResponse.data.data;
      console.log("updatedUserResult", updateUserResult);
      console.log("--------------------");

      const updatedUser = {
        ...authUser,
        readLater: updatedLaterArticles,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setAuthUser(updatedUser);

      setIsUpdating(false);
      return true;
    } catch (error: any) {
      setIsUpdating(false);
      return false;
    }
  };

  return { isUpdating, editLaterArticles };
};

export default useUpdateLaterArticles;
