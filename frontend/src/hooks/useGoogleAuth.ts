// import { useSignInWithGoogle } from "react-firebase-hooks/auth";
// import { auth, firestore } from "../firebase/firebase";
// import useShowToast from "./useShowToast";
// import useAuthStore from "../store/authStore";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { User, Response } from "../models";

// const useGoogleAuth = () => {
//   const [signInWithGoogle, , , errorG] = useSignInWithGoogle(auth);
//   const showToast = useShowToast();
//   const loginUser = useAuthStore((state) => state.login);

//   const handleGoogleAuth = async (data?: any) => {
//     console.log(data);
//     try {
//       const newUser = await signInWithGoogle();
//       if (!newUser) {
//         showToast("Error", errorG?.message, "error");
//         return false;
//       }

//       const userRef = doc(firestore, "users", newUser.user.uid);
//       const userSnap = await getDoc(userRef);

//       if (userSnap.exists()) {
//         const userDoc = userSnap.data() as User;
//         localStorage.setItem("user", JSON.stringify(userDoc));
//         loginUser(userDoc);
//         showToast("Success", "Logged in successfully", "success");
//         return true;
//       } else {
//         let dtoQuestionnaire = undefined;
//         if (data.responses.some((response: Response) => response.answer)) {
//           dtoQuestionnaire = {
//             responses: data.responses,
//             username: newUser.user.email?.split("@")[0],
//             userId: newUser.user.uid,
//           };
//         }
//         const userDoc: any = {
//           id: newUser.user.uid,
//           email: newUser.user.email || "",
//           username: newUser.user.email?.split("@")[0],
//           phone: "",
//           posts: [],
//           profilePic: newUser.user.photoURL || "",
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
//   return { handleGoogleAuth, errorG };
// };

// export default useGoogleAuth;
