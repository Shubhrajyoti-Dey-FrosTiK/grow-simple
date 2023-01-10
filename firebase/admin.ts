export const firebaseAdminConfig = {
  // type: "service_account",
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID || "",
  // private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/gm, "\n")
    : "",
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
  // client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  // auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
  // token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  // auth_provider_x509_cert_url:
  //   process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
  // client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
};
