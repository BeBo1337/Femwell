import { Box, Flex, Text, useMediaQuery } from "@chakra-ui/react";
import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPen } from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../../../store/authStore";
import useShowToast from "../../../hooks/useShowToast";
import { Navigate } from "react-router-dom";

interface SideBarProps {
  btnText?: string;
  Icon?: any;
  Func?: () => void;
  isSearch?: boolean;
}

const EditProfile: FC<SideBarProps> = ({}) => {
  const [isLargerThan400] = useMediaQuery("(min-width: 400px)");
  const [isLargerThan760] = useMediaQuery("(min-width: 760px)");

  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  const handleEditProfile = () => {
    if (authUser) {
      <Navigate to="/account" />;
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
        handleEditProfile();
      }}
    >
      <Flex
        p={2}
        alignItems={"center"}
        justifyContent={isLargerThan760 ? "flex-start" : "center"}
      >
        <FontAwesomeIcon
          style={{ paddingRight: isLargerThan760 ? "10px" : "" }}
          icon={faUserPen}
        />
        <Text display={isLargerThan760 ? "block" : "none"}>Edit Profile</Text>
      </Flex>
    </Box>
  );
};

export default EditProfile;
