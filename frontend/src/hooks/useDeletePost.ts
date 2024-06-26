import { useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import usePostStore from "../store/postStore";
import { DELETE_POST_MUTATION } from "../utils/wolverineRequests";
import axios from "axios";
import { print } from "graphql";

const useDeletePost = () => {
  const [isLoading, setIsLoading] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  // const posts = usePostStore((state) => state.posts);
  const deletePost = usePostStore((state) => state.deletePost);
  const showToast = useShowToast();

  const handleDeletePost = async (
    postId: string,
    userId: string,
    imageUrl: string | undefined,
  ) => {
    if (isLoading) return;
    if (postId && authUser) {
      setIsLoading(true);

      try {
        if (userId !== authUser.id) {
          showToast(
            "Error",
            "You are not authorized to edit this post",
            "error",
          );
          return;
        }

        if (imageUrl) {
          await axios.delete(
            `${import.meta.env.VITE_HEIMDALL_ENDPOINT}/delete`,
            {
              data: {
                path: `PostImages/${postId}`,
              },
              headers: {
                authorization: authUser.jwt,
              },
            },
          );
        }

        const deletePostResponse = await axios.post(
          `${import.meta.env.VITE_WOLVERINE_ENDPOINT}/graphql`,
          {
            query: print(DELETE_POST_MUTATION),
            variables: { id: postId },
          },
          {
            headers: {
              authorization: authUser.jwt,
            },
          },
        );
        const deleteResult = await deletePostResponse.data.data.deletePost;
        console.log("uploadResult", deleteResult);
        console.log("--------------------");

        deletePost(postId);
        setUser({
          ...authUser,
          posts:
            authUser.posts?.filter((post: string) => post !== postId) || [],
        });
        showToast("Success", "Post deleted successfully", "success");
      } catch (error: any) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };
  return { isLoading, handleDeletePost };
};

export default useDeletePost;
