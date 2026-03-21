"use client";

import { createContext, useContext, useState } from "react";
import LoginModal from "@/components/LoginModal";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [showLogin, setShowLogin] = useState(false);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  return (
    <AuthContext.Provider value={{ openLogin }}>
      {children}

      <LoginModal
        isOpen={showLogin}
        onClose={closeLogin}
      />
    </AuthContext.Provider>
  );
}