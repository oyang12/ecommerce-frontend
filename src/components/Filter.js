"use client";
import { useState } from "react";

export default function FilterSidebar() {
  // State untuk membuka/tutup kategori (accordion)
  const [openKategori, setOpenKategori] = useState(true);

  return (
    <div className="w-64 bg-white p-4 border-r border-gray-100 min-h-screen hidden md:block">
      <h2 className="text-lg font-bold mb-4 text-gray-900">Filter</h2>

      {/* --- SEKSI KATEGORI --- */}
      <div className="mb-6 border-b border-gray-50 pb-4">
        <button 
          onClick={() => setOpenKategori(!openKategori)}
          className="flex justify-between items-center w-full text-left font-bold text-sm text-gray-800 uppercase tracking-tight"
        >
          Kategori
          <span className={`transform transition-transform ${openKategori ? "rotate-180" : ""}`}>▼</span>
        </button>

        {openKategori && (
          <div className="mt-4 space-y-3 ml-2">
            <div className="group cursor-pointer">
              <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600 flex items-center">
                <span className="mr-2">›</span> Ibu & Bayi
              </p>
              <div className="ml-4 mt-2 space-y-2 text-xs text-gray-400">
                <p className="hover:text-blue-500 cursor-pointer">Popok</p>
                <p className="hover:text-blue-500 cursor-pointer">Perawatan Bayi</p>
                <p className="hover:text-blue-500 cursor-pointer text-blue-600 font-bold">Makanan Bayi</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- SEKSI JENIS TOKO --- */}
      <div className="mb-6 border-b border-gray-50 pb-4">
        <h3 className="font-bold text-sm text-gray-800 uppercase tracking-tight mb-4 flex justify-between">
          Jenis toko <span>▲</span>
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-600 group-hover:text-gray-900">Mall</span>
            <span className="text-[10px] bg-purple-100 text-purple-600 px-1 rounded">✔</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-600 group-hover:text-gray-900">Power Shop</span>
            <span className="text-green-500 text-xs">⭐</span>
          </label>
        </div>
      </div>

      {/* --- SEKSI LOKASI --- */}
      <div className="mb-6">
        <h3 className="font-bold text-sm text-gray-800 uppercase tracking-tight mb-4 flex justify-between">
          Lokasi <span>▲</span>
        </h3>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {["DKI Jakarta", "Jabodetabek", "Bandung", "Medan", "Surabaya"].map((loc) => (
            <label key={loc} className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">{loc}</span>
            </label>
          ))}
        </div>
        <button className="mt-4 text-xs font-bold text-emerald-500 hover:text-emerald-600">
          Lihat selengkapnya
        </button>
      </div>
    </div>
  );
}