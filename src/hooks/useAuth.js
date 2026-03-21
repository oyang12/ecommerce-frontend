"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuth(roleRequired = null) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const userSession = localStorage.getItem("user_session");

    if (!token || !userSession) {
      router.replace("/login");
      return;
    }

    const parsedUser = JSON.parse(userSession);
    setUser(parsedUser);

    if (roleRequired && parsedUser.role !== roleRequired) {
      router.replace("/");
    }

  }, [router, roleRequired]);

  return { user }; // ✅ selalu return object
}
