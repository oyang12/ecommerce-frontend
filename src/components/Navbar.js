"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null); // State untuk menyimpan data user
  const router = useRouter();

  // Ambil data user dari localStorage saat komponen dimuat
  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", search);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_session");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600 cursor-pointer">
          MyStore
        </Link>

        {/* Search - Tetap Muncul untuk Semua */}
        <form onSubmit={handleSearch} className="flex w-1/2">
          <input
            type="text"
            placeholder="Search product..."
            className="border w-full px-4 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="bg-blue-500 text-white px-6 rounded-r hover:bg-blue-600 transition">
            Search
          </button>
        </form>

        {/* Right Menu - DINAMIS TERGANTUNG USER */}
        <div className="flex items-center gap-6 text-sm text-gray-700">
          
          {/* 1. JIKA BELUM LOGIN (Halaman Awal) */}
          {!user && (
            <>
              <Link href="/register" className="hover:text-blue-600 transition font-medium">
                Daftar
              </Link>
              <Link href="/login" className="font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Login
              </Link>
            </>
          )}

          {/* 2. JIKA LOGIN SEBAGAI CUSTOMER */}
          {user && user.role === "customer" && (
            <>
              <Link href="/cart" className="cursor-pointer hover:text-blue-600 transition flex items-center gap-1">
                🛒 MyCart
              </Link>
              <Link href="/user/orders" className="hover:text-blue-600 transition font-medium">
                Pesanan
              </Link>
              <button onClick={handleLogout} className="text-red-500 font-bold hover:underline">
                Logout
              </button>
            </>
          )}

          {/* 3. JIKA LOGIN SEBAGAI ADMIN */}
          {user && user.role === "admin" && (
            <>
              <Link href="/admin/orders" className="hover:text-blue-600 transition font-medium">
                Pesanan (Status)
              </Link>
              <Link href="/admin/reports" className="hover:text-blue-600 transition font-medium">
                Laporan
              </Link>
              <button onClick={handleLogout} className="text-red-500 font-bold hover:underline">
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}
