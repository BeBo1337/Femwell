import {
  Box,
  Flex,
  Text,
  VStack,
  useMediaQuery,
  Avatar,
} from "@chakra-ui/react";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import useAuthStore from "../../store/authStore";
import SideBarItems from "./SideBar/SideBarItems";

interface SideBarProps {
  searchFunc?: () => void;
  myPostsFunc?: () => void;
  likedPostsFunc?: () => void;
  newPostFunc?: () => void;
}

const Sidebar: FC<SideBarProps> = ({}) => {
  const authUser = useAuthStore((state) => state.user);
  const [isLargerThan760] = useMediaQuery("(min-width: 760px)");
  const [isLargerThan400] = useMediaQuery("(min-width: 400px)");

  return (
    <Box
      height={"auto"}
      w={isLargerThan760 ? "180px" : isLargerThan400 ? "65px" : "45px"}
      borderRight={"3px solid"}
      borderColor={"var(--secondary-color)"}
      py={6}
      position={"sticky"}
      top={0}
      left={0}
      px={isLargerThan760 ? 4 : 2}
    >
      {authUser ? (
        <>
          <Flex
            direction="column"
            align="center"
            pb={isLargerThan760 ? 2 : isLargerThan400 ? 4 : 2}
          >
            <Avatar
              border="2px solid var(--secondary-color)"
              bgColor={"pink.500"}
              color={"white"}
              name={`${authUser.username}`}
              size={isLargerThan760 ? "lg" : isLargerThan400 ? "md" : "sm"}
              src={`${authUser.profilePic}`}
              mb={1}
            />
            <Text
              fontWeight={"bold"}
              display={isLargerThan760 ? "block" : "none"}
            >{`${authUser.username}`}</Text>
          </Flex>
        </>
      ) : (
        <>
          <Text hidden={!isLargerThan760} pl={2}>
            Welcome to Community Hub!
          </Text>
        </>
      )}

      <Flex
        alignItems="center"
        justifyContent="center"
        my={1}
        w="full"
        pb={isLargerThan760 ? 2 : 4}
      >
        <Box
          flex={1}
          h="1px"
          bg="var(--divider-color)"
          mx={isLargerThan400 ? 1 : 0.25}
        />
        <FontAwesomeIcon icon={faHeart} color="var(--divider-color)" />
        <Box
          flex={1}
          h="1px"
          bg="var(--divider-color)"
          mx={isLargerThan400 ? 1 : 0.25}
        />
      </Flex>

      <VStack gap={4} w="full">
        <SideBarItems />
      </VStack>
    </Box>
  );
};

export default Sidebar;
