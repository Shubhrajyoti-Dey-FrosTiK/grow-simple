import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, googleAuthProvider } from "./firebase";
import axios from "axios";

export const googleSignIn = () => {
  signInWithPopup(auth, googleAuthProvider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};

export const check = async () => {
  console.log(await auth.currentUser?.getIdToken());

  const response = await axios.post(
    "http://localhost:5001/api/role/admin",
    {
      emailArray: ["toshubhrajyotidey@gmail.com"],
    },
    {
      headers: {
        idtoken: await auth.currentUser?.getIdToken(true),
      },
    }
  );

  console.log(response.data);
  if (response.data.error) {
    auth.signOut();
  }
};
