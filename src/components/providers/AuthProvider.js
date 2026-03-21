"use client";

import { createContext, useContext, useEffect, useState } from "react";
import LoginModal from "@/components/LoginModal";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

  // 🔥 INIT USER (AUTO LOGIN)
  useEffect(() => {
    const storedUser = localStorage.getItem("user_session");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 🔐 OPEN LOGIN
  const openLogin = ({ redirect } = {}) => {
    if (redirect) setRedirectAfterLogin(redirect);
    setShowLogin(true);
  };

  const closeLogin = () => setShowLogin(false);

  // ✅ LOGIN SUCCESS
  const loginSuccess = (userData) => {
    localStorage.setItem("user_session", JSON.stringify(userData));
    setUser(userData);
    setShowLogin(false);

    // 🚀 REDIRECT BALIK
    if (redirectAfterLogin) {
      window.location.href = redirectAfterLogin;
      setRedirectAfterLogin(null);
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("user_session");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        openLogin,
        closeLogin,
        loginSuccess,
        logout,
      }}
    >
      {children}

      <LoginModal
        isOpen={showLogin}
        onClose={closeLogin}
        onSuccess={loginSuccess}
      />
    </AuthContext.Provider>
  );
}
