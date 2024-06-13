import { useState, useEffect, FC } from "react";
import { Link } from "react-router-dom";
import {
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
  Text,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../assets/Navbar.css";
import {
  faBars,
  faHeartCircleCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import InputForm from "../Forms/InputForm";
import SideMenu from "./SideMenu";
import useAuthStore from "../../store/authStore";
import useLogout from "../../hooks/useLogout";
import ColorModeSwitch from "../ColorModeSwitch";
import { Colors } from "../../utils/colorsConstants";
import LogoSvg from "./LogoSvg";
import LoginForm from "../Forms/LoginForm";

const Navbar: FC<{}> = () => {
  const {
    isOpen: isSideMenuOpen,
    onOpen: onSideMenuOpen,
    onClose: onSideMenuClose,
  } = useDisclosure();
  const {
    isOpen: isInputFormOpen,
    onOpen: onInputFormOpen,
    onClose: onInputFormClose,
  } = useDisclosure();
  const authUser = useAuthStore((state) => state.user);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { logout, isLoggingOut } = useLogout();
  const [isLargerThan500] = useMediaQuery("(min-width: 500px)");
  const navFadeColor = useColorModeValue(
    Colors.primaryColor,
    Colors.secondaryColor,
  );

  const handleClick = (): void => {
    if (!isSideMenuOpen) {
      onSideMenuOpen();
    } else {
      onSideMenuClose();
    }
  };

  return (
    <>
      <nav
        className="navbar"
        // style={{
        //   background: `${navFadeColor}`,
        // }}
      >
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={onSideMenuClose}>
            <LogoSvg
              fillColor="white"
              mt="0"
              width={isLargerThan500 ? "100px" : "80px"}
            />
            <Text mt={"6px"} fontSize={24} fontFamily={"kalam"}>
              {isLargerThan500 ? "Femwell " : ""}
            </Text>
          </Link>
          <ColorModeSwitch />
          <div className="nav-right-section">
            <div className="menu-icon" onClick={handleClick}>
              <FontAwesomeIcon icon={isSideMenuOpen ? faTimes : faBars} />
            </div>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link
                  to="/home"
                  className="nav-links"
                  onClick={onSideMenuClose}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/community"
                  className="nav-links"
                  onClick={onSideMenuClose}
                >
                  Community
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/ION" className="nav-links" onClick={onSideMenuClose}>
                  Information
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/premium"
                  className="nav-links"
                  onClick={onSideMenuClose}
                >
                  Premium
                </Link>
              </li>
              {!authUser ? (
                <li className="nav-item">
                  <a
                    className="nav-links"
                    onClick={() => {
                      onInputFormOpen();
                    }}
                  >
                    Login
                  </a>
                </li>
              ) : (
                <li className="nav-item">
                  <a
                    className="nav-links"
                    onClick={() => {
                      logout();
                    }}
                  >
                    Logout
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <LoginForm
        isOpen={isInputFormOpen}
        onClose={onInputFormClose}
        onOpen={onInputFormOpen}
      />
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={onSideMenuClose}
        onOpen={onSideMenuOpen}
        onInputFormOpen={onInputFormOpen}
      />
    </>
  );
};

export default Navbar;
