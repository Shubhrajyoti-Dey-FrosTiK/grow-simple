import * as functions from "firebase-functions";
import clientPromise from "../../lib/mongodb";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.onCreate = functions.auth.user().onCreate(async (user) => {
  // ...
  await clientPromise;

  const userCredentials = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };

  console.log(userCredentials);
  return true;
});
