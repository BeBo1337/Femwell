// import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
// import { auth, firestore } from "../firebase/firebase";
// import { doc, setDoc } from "firebase/firestore";
// import { set } from "date-fns";
import userAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { Response } from "../models/reponse.model";

// const useSignupEmailPassword = () => {
//   const [createUserWithEmailAndPassword, , isSigningUp, errorSU] =
//     useCreateUserWithEmailAndPassword(auth);
//   const showToast = useShowToast();
//   const loginUser = userAuthStore((state) => state.login);
//   const signup = async (data: any) => {
//     console.log(data);
//     if (
//       !data.email ||
//       !data.username ||
//       !data.password ||
//       !data.confirmPassword
//     ) {
//       showToast("Error", "Please enter all required fields", "error");
//       return false;
//     }
//     try {
//       const newUser = await createUserWithEmailAndPassword(
//         data.email,
//         data.password,
//       );
//       if (!newUser) {
//         showToast("Error", "Email already in use", "error");
//         return false;
//       }
//       if (newUser) {
//         let dtoQuestionnaire = undefined;
//         if (data.responses.some((response: Response) => response.answer)) {
//           dtoQuestionnaire = {
//             responses: data.responses,
//             username: data.username,
//             userId: newUser.user.uid,
//           };
//         }
//         let userDoc: any = {
//           id: newUser.user.uid,
//           email: data.email,
//           username: data.username,
//           phone: data.phone,
//           posts: [],
//           pfpURL: "",
//           laterArticles: [],
//         };
//         if (dtoQuestionnaire) userDoc.questionnaire = dtoQuestionnaire;
//         await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);
//         localStorage.setItem("user", JSON.stringify(userDoc));
//         loginUser(userDoc);
//         showToast("Success", "Account created successfully", "success");
//         return true;
//       }
//     } catch (error: any) {
//       showToast("Error", error.message, "error");
//       return false;
//     }
//   };
//   return { signup, isSigningUp, errorSU };
// };

// export default useSignupEmailPassword;

import axios from "axios";
import { useState } from "react";
import { print } from "graphql";
import {
  CONFIRM_USER_MUTATION,
  REGISTER_REQUEST_MUTATION,
} from "../utils/vaultRequests";
import {
  CREATE_QUESTIONNAIRE_MUTATION,
  GET_USER_PROFILE_QUERY,
} from "../utils/wolverineRequests";
import { Questionnare } from "../models";

const useSignupEmailPassword = () => {
  const loginUser = userAuthStore((state) => state.login);
  const showToast = useShowToast();

  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isConfirmingCode, setIsConfirmingCode] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [createQuestionnaireInput, setDtoQuestionnaire] =
    useState<Questionnare | null>(null);
  const [showEmailVerifyPage, setShowEmailVerifyPage] = useState(false);

  const signup = async (data: any) => {
    console.log("Signup invoked");
    setIsSigningUp(true);
    if (
      !data.email ||
      !data.username ||
      !data.password ||
      !data.confirmPassword
    ) {
      showToast("Error", "Please enter all required fields", "error");
      setIsSigningUp(false);
      return false;
    }
    setEmail(data.email);
    setPassword(data.password);

    const registerRequest = {
      profileUsername: data.username,
      email: data.email,
      password: data.password,
      phoneNumber: data.phone || "",
    };
    console.log("registerRequest", registerRequest);
    try {
      const registerResponse = await axios.post(
        `${import.meta.env.VITE_VAULT_ENDPOINT}/graphql`,
        {
          query: print(REGISTER_REQUEST_MUTATION),
          variables: { registerRequest },
        },
      );

      const registerResult = await registerResponse.data;
      console.log("registerResult", registerResult);
      console.log("--------------------");

      let questionnaire = null;
      if (
        data.responses.some((response: Response) => response.answer) &&
        registerResponse.data
      ) {
        questionnaire = {
          username: data.username,
          responses: data.responses,
          userId: registerResult.data.register.id,
        };
        setDtoQuestionnaire(questionnaire);
      }

      setShowEmailVerifyPage(true);
    } catch (error: any) {
      showToast("Error", "User creation failed", "error");
      setShowEmailVerifyPage(false);
      setIsSigningUp(false);
      throw new Error(error.message);
    }
  };

  const handleVerification = async (code: string) => {
    setIsConfirmingCode(true);
    try {
      const confirmUserRequest = {
        code,
        email,
        password,
      };
      console.log("confirmUserRequest", confirmUserRequest);

      const confirmUserResponse = await axios.post(
        `${import.meta.env.VITE_VAULT_ENDPOINT}/graphql`,
        {
          query: print(CONFIRM_USER_MUTATION),
          variables: { confirmUserRequest },
        },
      );

      const confirmResult = await confirmUserResponse.data;
      console.log("confirmUserResponse", confirmResult);
      console.log("--------------------");

      if (createQuestionnaireInput) {
        console.log("createQuestionnaireInput", createQuestionnaireInput);
        const setQuesionnaireResponse = await axios.post(
          `${import.meta.env.VITE_WOLVERINE_ENDPOINT}/graphql`,
          {
            query: print(CREATE_QUESTIONNAIRE_MUTATION),
            variables: { createQuestionnaireInput },
          },
          {
            headers: {
              authorization: confirmResult.data.confirm.jwt,
            },
          },
        );

        const questionnaireResult = await setQuesionnaireResponse.data;
        console.log("questionnaireResult", questionnaireResult);
        console.log("--------------------");
      }

      console.log("user id", confirmResult.data.confirm.id);
      const getUserResponse = await axios.post(
        `${import.meta.env.VITE_WOLVERINE_ENDPOINT}/graphql`,
        {
          query: print(GET_USER_PROFILE_QUERY),
          variables: { id: confirmResult.data.confirm.id },
        },
        {
          headers: {
            authorization: confirmResult.data.confirm.jwt,
          },
        },
      );

      const userResult = await getUserResponse.data;
      console.log("userResult", userResult.data);
      console.log("--------------------");
      setShowEmailVerifyPage(false);
      if (userResult) {
        localStorage.setItem("user", JSON.stringify(userResult.data.oneUser));
        loginUser({
          ...userResult.data.oneUser,
          jwt: confirmResult.data.confirm.jwt,
          refreshToken: confirmResult.data.confirm.refreshToken,
        });

        return true;
      } else {
        showToast(
          "Error",
          "User registration failed, something went wrong while getting the user",
          "error",
        );
        return false;
      }
    } catch (error: any) {
      showToast("Error", "User verification failed", "error");
      throw new Error(error.message);
    } finally {
      setIsSigningUp(false);
      setIsConfirmingCode(false);
      return false;
    }
  };

  return {
    signup,
    isSigningUp,
    isConfirmingCode,
    showEmailVerifyPage,
    setShowEmailVerifyPage,
    handleVerification,
  };
};

export default useSignupEmailPassword;
