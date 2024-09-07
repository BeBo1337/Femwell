import { FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  VStack,
  Avatar,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import useAuthStore from "../../store/authStore";
import useLogout from "../../hooks/useLogout";
import useShowToast from "../../hooks/useShowToast";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onInputFormOpen: () => void;
}

const SideMenu: FC<SideMenuProps> = ({ isOpen, onClose, onInputFormOpen }) => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      preserveScrollBarGap
    >
      <DrawerOverlay bg="transparent" />
      <DrawerContent
        bg="var(--primary-color)"
        maxWidth="300px"
        height="90vh"
        marginTop="10vh"
        borderLeft="3px solid var(--secondary-color)"
      >
        <DrawerHeader mb="-4">
          {authUser ? (
            <>
              <Flex direction="row" align="center">
                <VStack align="start">
                  <Box>Welcome Back!</Box>
                  <Box>{`${authUser.username}`}</Box>
                </VStack>
                <Avatar
                  border="2px solid var(--secondary-color)"
                  bgColor={"pink.500"}
                  color={"white"}
                  name={`${authUser.username}`}
                  size="lg"
                  src={`${authUser.profilePic}`}
                  ml="auto"
                />
              </Flex>
            </>
          ) : (
            <>
              <Box>Welcome to Femwell!</Box>
            </>
          )}
        </DrawerHeader>
        <DrawerBody>
          <VStack justifyContent="center" alignItems="center" spacing={5}>
            <Flex alignItems="center" justifyContent="center" my={1} w="full">
              <Box flex={1} h="1px" bg="var(--divider-color)" mx={1} />
              <FontAwesomeIcon icon={faHeart} color="var(--divider-color)" />
              <Box flex={1} h="1px" bg="var(--divider-color)" mx={1} />
              <FontAwesomeIcon icon={faHeart} color="var(--divider-color)" />
              <Box flex={1} h="1px" bg="var(--divider-color)" mx={1} />
              <FontAwesomeIcon icon={faHeart} color="var(--divider-color)" />
              <Box flex={1} h="1px" bg="var(--divider-color)" mx={1} />
            </Flex>
            <Button
              colorScheme="pink"
              w="full"
              onClick={() => {
                onClose();
                navigate("/");
              }}
            >
              Home
            </Button>

            <Button
              colorScheme="pink"
              w="full"
              onClick={() => {
                onClose();
                navigate("/community");
              }}
            >
              Community
            </Button>
            <Button
              colorScheme="pink"
              w="full"
              onClick={() => {
                onClose();
                navigate("/ION");
              }}
            >
              Information
            </Button>
            <Button
              colorScheme="pink"
              w="full"
              onClick={(e) => {
                if (!authUser || authUser.role === "User") {
                  e.preventDefault();
                  showToast(
                    "Unauthorized",
                    "This is a premium feature",
                    "info",
                    "zen",
                  );
                } else {
                  onClose();
                }
              }}
            >
              Zen
            </Button>

            {!authUser && (
              <Button
                colorScheme="pink"
                w="full"
                onClick={() => {
                  onInputFormOpen();
                }}
              >
                Login
              </Button>
            )}
            {authUser && (
              <Button
                colorScheme="pink"
                w="full"
                onClick={() => {
                  onClose();
                  navigate("/account");
                }}
              >
                Account
              </Button>
            )}
            {authUser?.role === "Padulla" && (
              <Button
                colorScheme="pink"
                w="full"
                onClick={() => {
                  onClose();
                  navigate("/livechats");
                }}
              >
                Chat Center
              </Button>
            )}
          </VStack>
        </DrawerBody>
        {authUser && (
          <DrawerFooter>
            <Button
              variant="outline"
              colorScheme="pink"
              w="full"
              onClick={() => {
                logout();
                onClose();
              }}
            >
              Logout
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default SideMenu;
