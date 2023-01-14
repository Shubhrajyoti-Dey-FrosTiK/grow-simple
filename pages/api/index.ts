import admin, { ServiceAccount } from "firebase-admin";
import * as functions from "firebase-functions";

import type { NextApiRequest, NextApiResponse } from "next";
import { firebaseAdminConfig } from "../../firebase/admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig as ServiceAccount),
  });
}

// export const config = {
//   runtime: "edge",
// };

const claim = {
  moderator: true,
  paid: true,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await admin.auth().getUserByEmail("tosumandey77@gmail.com");

  // admin.auth().setCustomUserClaims(user.uid, claim);
  res.status(200).json(user);
}

exports.createUser = functions.auth.user().onCreate((user) => {
  console.log("CREATED: ", user);
});
