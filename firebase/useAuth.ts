import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { User } from "firebase/auth";

export function useAuth() {
  const [authState, setAuthState] = useState<{
    user: User | null;
    pending: boolean;
    isSignedIn: boolean;
  }>({
    isSignedIn: false,
    pending: true,
    user: null,
  });

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((user) =>
      setAuthState({ user, pending: false, isSignedIn: !!user })
    );
    return () => unregisterAuthObserver();
  }, []);

  return { auth, ...authState };
}
