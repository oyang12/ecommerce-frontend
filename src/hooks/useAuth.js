"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuth(roleRequired = null) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userSession = localStorage.getItem("user_session");

    // ❌ BELUM LOGIN
    if (!token || !userSession) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(userSession);

    // ❌ ROLE TIDAK SESUAI
    if (roleRequired && user.role !== roleRequired) {
      router.replace("/");
      return;
    }

  }, [router, roleRequired]);
}