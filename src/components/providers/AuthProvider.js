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

  // 🔥 LOAD USER DARI LOCALSTORAGE
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  // 🔐 OPEN LOGIN + REDIRECT
  const openLogin = ({ redirect } = {}) => {
    if (redirect) {
      setRedirectAfterLogin(redirect);
    }
    setShowLogin(true);
  };

  const closeLogin = () => setShowLogin(false);

  // ✅ LOGIN SUCCESS (DIPANGGIL DARI MODAL)
  const loginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setShowLogin(false);

    // 🚀 REDIRECT SETELAH LOGIN
    if (redirectAfterLogin) {
      window.location.href = redirectAfterLogin;
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
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
        onSuccess={loginSuccess} // ⬅️ penting!
      />
    </AuthContext.Provider>
  );
}
