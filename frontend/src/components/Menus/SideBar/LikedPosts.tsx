import { Box, Flex, Text, useMediaQuery } from "@chakra-ui/react";
import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import useShowToast from "../../../hooks/useShowToast";
import usePostStore from "../../../store/postStore";
import useAuthStore from "../../../store/authStore";
// import useProfileStore from "../../../store/profileStore";
import { queryTypes } from "../../../utils/userPostQueries";
import useGetUserPost from "../../../hooks/useGetUserPost";

interface SideBarProps {
  btnText?: string;
  Icon?: any;
  Func?: () => void;
  isSearch?: boolean;
}

const LikedPosts: FC<SideBarProps> = ({}) => {
  const [isLargerThan400] = useMediaQuery("(min-width: 400px)");
  const [isLargerThan760] = useMediaQuery("(min-width: 760px)");

  const authUser = useAuthStore((state) => state.user);
  // const userProfile = useProfileStore((state) => state.userProfile);
  // const setPostsQuery = usePostStore((state) => state.setPostsQuery);
  const queryType = usePostStore((state) => state.queryType);
  // const { getUserProfile } = useSearchUser();
  const { getPosts } = useGetUserPost();
  const showToast = useShowToast();

  const handleLikedPosts = async () => {
    if (authUser) {
      if (queryType !== queryTypes.LIKED_POSTS) {
        // if (userProfile?.username === authUser.username) {
        //   setPostsQuery(queryTypes.LIKED_POSTS);
        // } else {
        //   await getUserProfile(authUser.username, queryTypes.LIKED_POSTS);
        // }
        await getPosts({ queryType: queryTypes.LIKED_POSTS });
      }
    } else {
      showToast(
        "Error",
        "Please Login to use this feature",
        "error",
        "NotLogged",
      );
    }
  };

  return (
    <Box
      w={isLargerThan760 ? "full" : ""}
      pl={isLargerThan760 ? 2 : 0}
      px={isLargerThan760 ? 0 : isLargerThan400 ? 2 : 0}
      cursor={"pointer"}
      borderRadius={6}
      _hover={{ bg: "var(--hover-color-dim)" }}
      onClick={() => {
        handleLikedPosts();
      }}
    >
      <Flex
        p={2}
        alignItems={"center"}
        justifyContent={isLargerThan760 ? "flex-start" : "center"}
      >
        <FontAwesomeIcon
          style={{ paddingRight: isLargerThan760 ? "10px" : "" }}
          icon={faThumbsUp}
        />
        <Text display={isLargerThan760 ? "block" : "none"}>Liked Posts</Text>
      </Flex>
    </Box>
  );
};

export default LikedPosts;
