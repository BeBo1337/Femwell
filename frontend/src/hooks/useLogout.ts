// import { useSignOut } from "react-firebase-hooks/auth";
// import { auth } from "../firebase/firebase";
import userAuthStore from "../store/authStore";

const useLogout = () => {
  // const [signOut, isLoggingOut, errorLO] = useSignOut(auth);

  const logoutUser = userAuthStore((state) => state.logout);
  const logout = async () => {
    try {
      // await signOut();
      localStorage.removeItem("user");
      logoutUser();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };
  return { logout };
};

export default useLogout;
