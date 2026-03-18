"use client";

import { useState } from "react";
import Link from "next/link"; // 1. Import Link

export default function Navbar() {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", search);
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo - Bungkus dengan Link agar bisa balik ke Home */}
        <Link href="/" className="text-2xl font-bold text-blue-600 cursor-pointer">
          MyStore
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex w-1/2">
          <input
            type="text"
            placeholder="Search product..."
            className="border w-full px-4 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="bg-blue-500 text-white px-6 rounded-r hover:bg-blue-600 transition">
            Search
          </button>
        </form>

        {/* Right Menu */}
        <div className="flex items-center gap-6">
          <div className="cursor-pointer hover:text-blue-600 transition">
            🛒 Cart
          </div>

          {/* 2. Ubah div Login menjadi Link */}
          <Link href="/login" className="cursor-pointer font-semibold hover:text-blue-600 transition">
            Login
          </Link>
        </div>

      </div>
    </nav>
  );
}
