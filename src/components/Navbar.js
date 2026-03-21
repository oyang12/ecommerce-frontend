"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  // ✅ SINGLE SOURCE OF TRUTH
  const { user, openLogin, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", search);
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <Link href="/" className="text-2xl font-bold text-blue-600">
          MyStore
        </Link>

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

        <div className="flex items-center gap-6 text-sm text-gray-700">

          {/* ❌ BELUM LOGIN */}
          {!user && (
            <>
              <Link href="/register">Daftar</Link>
              <button
                onClick={() => openLogin()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Login
              </button>
            </>
          )}

          {/* ✅ CUSTOMER */}
          {user?.role === "customer" && (
            <>
              <Link href="/user/mycart">🛒 MyCart</Link>
              <Link href="/user/orders">Pesanan</Link>
              <button onClick={logout} className="text-red-500">
                Logout
              </button>
            </>
          )}

          {/* ✅ ADMIN */}
          {user?.role === "admin" && (
            <>
              <Link href="/admin/orders">Pesanan</Link>
              <Link href="/admin/reports">Laporan</Link>
              <button onClick={logout} className="text-red-500">
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}
