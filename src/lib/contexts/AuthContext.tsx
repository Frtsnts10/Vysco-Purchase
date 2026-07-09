"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dummy account check
    if (typeof window !== "undefined" && localStorage.getItem("vysco_dummy_auth") === "true") {
      setUser({ email: "admin@vysco.com", uid: "dummy-123", displayName: "Admin" } as User);
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("vysco_dummy_auth") === "true") {
        localStorage.removeItem("vysco_dummy_auth");
        setUser(null);
      } else {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
