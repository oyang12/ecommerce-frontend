"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider"; // ✅ tambah ini

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { openLogin } = useAuth(); // ✅ ambil dari context

  // 🔥 FUNCTION AMBIL USER
  const loadUser = () => {
    const session = localStorage.getItem("user_session");
    setUser(session ? JSON.parse(session) : null);
  };

  // 🔥 LOAD AWAL + LISTENER
  useEffect(() => {
    loadUser();

    window.addEventListener("authChanged", loadUser);

    return () => {
      window.removeEventListener("authChanged", loadUser);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", search);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_session");

    window.dispatchEvent(new Event("authChanged"));

    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          MyStore
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex w-1/2">
          <input
            type="text"
            placeholder="Search product..."
            className="border w-full px-4 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-6 rounded-r hover:bg-blue-600">
            Search
          </button>
        </form>

        {/* MENU DINAMIS */}
        <div className="flex items-center gap-6 text-sm text-gray-700">

          {/* BELUM LOGIN */}
          {!user && (
            <>
              <Link href="/register">Daftar</Link>

              {/* 🔥 LOGIN GLOBAL (FIX) */}
              <button
                onClick={openLogin} // ✅ GANTI INI
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Login
              </button>
            </>
          )}

          {/* CUSTOMER */}
          {user?.role === "customer" && (
            <>
              <Link href="/user/mycart">🛒 MyCart</Link>
              <Link href="/user/orders">Pesanan</Link>
              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            </>
          )}

          {/* ADMIN */}
          {user?.role === "admin" && (
            <>
              <Link href="/admin/orders">Pesanan</Link>
              <Link href="/admin/reports">Laporan</Link>
              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}
