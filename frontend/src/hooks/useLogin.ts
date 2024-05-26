import userAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import axios from "axios";
import { print } from "graphql";
import { LOGIN_MUTATION } from "../utils/vaultRequests";
import { GET_USER_PROFILE_QUERY } from "../utils/wolverineRequests";
import { useState } from "react";

const useLogin = () => {
  const [isLoggingIn, setisLoggingIn] = useState(false);
  const showToast = useShowToast();
  const loginUser = userAuthStore((state) => state.login);
  const login = async (data: any) => {
    if (!data.email || !data.password) {
      showToast("Error", "Please enter all the fields", "error");
      return false;
    }
    setisLoggingIn(true);
    try {
      const authenticateRequest = {
        username: data.email,
        password: data.password,
      };
      console.log("authenticateRequest", authenticateRequest);

      const authenticateResponse = await axios.post(
        `${import.meta.env.VITE_VAULT_ENDPOINT}/graphql`,
        {
          query: print(LOGIN_MUTATION),
          variables: { authenticateRequest },
        },
      );

      const authenticateResult = await authenticateResponse.data;
      console.log("autheticateResult", authenticateResult);

      if (authenticateResult && authenticateResult.data.login.id) {
        console.log("user id", authenticateResult.data.login.id);
        const getUserResponse = await axios.post(
          `${import.meta.env.VITE_WOLVERINE_ENDPOINT}/graphql`,
          {
            query: print(GET_USER_PROFILE_QUERY),
            variables: { id: authenticateResult.data.login.id },
          },
          {
            headers: {
              authorization: authenticateResult.data.login.jwt,
            },
          },
        );

        const userResult = await getUserResponse.data;
        console.log("userResult", userResult.data);
        if (userResult) {
          localStorage.setItem("user", JSON.stringify(userResult.data.oneUser));
          loginUser({
            ...userResult.data.oneUser,
            jwt: authenticateResult.data.jwt,
            refreshToken: authenticateResult.data.refreshToken,
          });
          showToast("Success", "Logged in successfully", "success");
          return true;
        }
      } else {
        showToast("Error", "Failed to login", "error");
        return false;
      }
    } catch (error: any) {
      showToast("Error", error.message, "error");
      return false;
    } finally {
      setisLoggingIn(false);
    }
  };
  return { login, isLoggingIn };
};

export default useLogin;
