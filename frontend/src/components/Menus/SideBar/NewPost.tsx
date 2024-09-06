import { useDisclosure } from "@chakra-ui/react";
import "../../../assets/App.css";
import { Box, Flex, Text, useMediaQuery } from "@chakra-ui/react";
import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";

import CreateOrUpdatePost from "./createOrUpdatePost";
import useAuthStore from "../../../store/authStore";
import useShowToast from "../../../hooks/useShowToast";

interface SideBarProps {
  btnText?: string;
  Icon?: any;
  Func?: () => void;
  isSearch?: boolean;
}

const NewPost: FC<SideBarProps> = ({}) => {
  const [isLargerThan400] = useMediaQuery("(min-width: 400px)");
  const [isLargerThan760] = useMediaQuery("(min-width: 760px)");
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Box
        w={isLargerThan760 ? "full" : ""}
        pl={isLargerThan760 ? 2 : 0}
        px={isLargerThan760 ? 0 : isLargerThan400 ? 2 : 0}
        cursor={"pointer"}
        borderRadius={6}
        _hover={{ bg: "var(--hover-color-dim)" }}
        onClick={() => {
          authUser
            ? onOpen()
            : showToast(
                "Error",
                "Please Login to use this feature",
                "error",
                "NotLogged",
              );
        }}
      >
        <Flex
          p={2}
          alignItems={"center"}
          justifyContent={isLargerThan760 ? "flex-start" : "center"}
        >
          <FontAwesomeIcon
            style={{ paddingRight: isLargerThan760 ? "10px" : "" }}
            icon={faPenToSquare}
          />
          <Text display={isLargerThan760 ? "block" : "none"}>New Post</Text>
        </Flex>
      </Box>
      <CreateOrUpdatePost
        isWinOpen={isOpen}
        onWinOpen={onOpen}
        onWinClose={onClose}
        mode="create"
      />
    </>
  );
};

export default NewPost;
