"use client";

import { useState } from "react";

export default function Navbar() {

  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", search);
  };

  return (

    <nav className="bg-white shadow-md p-4">

      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">
          MyStore
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex w-1/2"
        >

          <input
            type="text"
            placeholder="Search product..."
            className="border w-full px-4 py-2 rounded-l"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 rounded-r"
          >
            Search
          </button>

        </form>

        {/* Right Menu */}
        <div className="flex items-center gap-6">

          <div className="cursor-pointer">
            🛒 Cart
          </div>

          <div className="cursor-pointer">
            Login
          </div>

        </div>

      </div>

    </nav>
  );
}