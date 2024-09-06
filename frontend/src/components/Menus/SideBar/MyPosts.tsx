import { Box, Flex, Text, useMediaQuery } from "@chakra-ui/react";
import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../../../store/authStore";
// import useProfileStore from "../../../store/profileStore";
import { queryTypes } from "../../../utils/userPostQueries";
import useShowToast from "../../../hooks/useShowToast";
import usePostStore from "../../../store/postStore";
import useGetUserPost from "../../../hooks/useGetUserPost";

interface SideBarProps {
  btnText?: string;
  Icon?: any;
  Func?: () => void;
  isSearch?: boolean;
}

const MyPosts: FC<SideBarProps> = ({}) => {
  const [isLargerThan400] = useMediaQuery("(min-width: 400px)");
  const [isLargerThan760] = useMediaQuery("(min-width: 760px)");
  const authUser = useAuthStore((state) => state.user);
  // const userProfile = useProfileStore((state) => state.userProfile);
  const queryType = usePostStore((state) => state.queryType);
  // const { getUserProfile } = useSearchUser();
  const { getPosts } = useGetUserPost();
  const showToast = useShowToast();

  const handleMyPosts = async () => {
    if (authUser) {
      if (queryType !== queryTypes.MY_POSTS) {
        await getPosts({ queryType: queryTypes.MY_POSTS });
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
        handleMyPosts();
      }}
    >
      <Flex
        p={2}
        alignItems={"center"}
        justifyContent={isLargerThan760 ? "flex-start" : "center"}
      >
        <FontAwesomeIcon
          style={{ paddingRight: isLargerThan760 ? "10px" : "" }}
          icon={faBookmark}
        />
        <Text display={isLargerThan760 ? "block" : "none"}>My Posts</Text>
      </Flex>
    </Box>
  );
};

export default MyPosts;
