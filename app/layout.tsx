"use client";
import React from "react";
import RootStyleRegistry from "./emotion";

// Redux
import ReduxProvider from "./redux";

import "./globals.css";

// Firebase

// Components
import { Button } from "../components/components";
// import { googleSignIn } from "../firebase/auth";

export const config = {
  runtime: "experimental-edge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  return (
    <html lang="en-US">
      <head />
      <body>
        <ReduxProvider>
          <RootStyleRegistry>
            {/* <Button onClick={googleSignIn}>Login with GOOGLE</Button> */}
            {children}
          </RootStyleRegistry>
        </ReduxProvider>
      </body>
    </html>
  );
}
