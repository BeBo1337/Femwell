import { FC } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Navbar from "./components/Menus/Navbar";
import "./index.css";
import "./assets/App.css";
import Home from "./pages/Home";
import CommunityHub from "./pages/CommunityHub";
import Fab from "./components/Menus/ActionButton";
import useAuthStore from "./store/authStore";
import AccountSettings from "./pages/AccountSettings";
import ION from "./pages/ION";
import Welcome from "./pages/Welcome";
import LiveChatCenter from "./pages/LiveChatCenter";
import Zen from "./pages/Zen";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const App: FC<{}> = () => {
  const authUser = useAuthStore((state) => state.user);

  const theme = extendTheme({
    config,
    styles: {
      global: (props: any) => ({
        body: {
          backgroundColor: props.colorMode === "dark" ? "#250515" : "#fbf2f7",
          color: props.colorMode === "dark" ? "#fbf2f7" : "#250515",
          paddingTop: "10vh",
        },
      }),
    },
    components: {
      Button: {
        baseStyle: {
          _focus: {
            boxShadow: "none",
          },
        },
      },
      Menu: {
        baseStyle: {
          list: {
            bg: "var(--quaternary-color)",
            fontSize: "16px",
          },
          item: {
            bg: "var(--quaternary-color)",
            fontWeight: "600",
            _focus: { bg: "var(--hover-menu-color)" },
          },
        },
      },
    },
    colors: {
      fabColor: {
        200: "#86003C",
        300: "#5A052E",
        400: "#3F0421",
        500: "#86003C",
        600: "#5A052E",
        700: "#3F0421",
      },
    },
  });

  const FabWithLocation = () => {
    const location = useLocation();

    return authUser &&
      location.pathname !== "/account" &&
      location.pathname !== "/livechats" ? (
      <Fab />
    ) : null;
  };

  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Navbar />
        <FabWithLocation />
        <Routes>
          <Route
            path="/"
            element={!authUser ? <Welcome /> : <Navigate to="/home" />}
          />
          <Route path="/home" element={<Home />} />
          <Route path="/community" element={<CommunityHub />} />
          <Route
            path="/account"
            element={authUser ? <AccountSettings /> : <Navigate to="/" />}
          />
          <Route
            path="/zen"
            element={
              authUser && authUser.role !== "User" ? (
                <Zen />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/livechats"
            element={
              authUser?.role === "Padulla" ? (
                <LiveChatCenter />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/ION" element={<ION />} />
          <Route
            path="*"
            element={!authUser ? <Welcome /> : <Navigate to="/home" />}
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;
