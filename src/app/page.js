'use client'; 

import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Filter from "@/components/Filter"; // Komponen filter yang kamu beri nama Filter.js
import { fetchProducts } from '../services/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then((res) => {
      const dataArray = res.data ? res.data : res;
      setProducts(Array.isArray(dataArray) ? dataArray : []);
      setLoading(false);
    }).catch(err => {
      console.error("Gagal memuat produk:", err);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-900 border-opacity-50"></div>
        <p className="mt-4 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">Menyiapkan Koleksi Terbaik...</p>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-black">
      {/* Container Utama dengan Flexbox */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 p-6">
        
        {/* --- SIDEBAR FILTER (KIRI) --- */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Filter />
        </aside>

        {/* --- MAIN CONTENT (KANAN) --- */}
        <main className="flex-1">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Produk Kami</h1>
              <p className="text-gray-500 mt-1 italic text-sm">Temukan produk impian Anda dengan kualitas terbaik.</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[40px] shadow-sm border border-gray-100">
              <div className="text-6xl mb-4 opacity-10">📦</div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em]">Belum ada produk saat ini.</p>
            </div>
          ) : (
            /* GRID SECTION */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} p={product} />
              ))}
            </div>
          )}

          {/* FOOTER DECORATION */}
          <div className="mt-20 mb-10 border-t border-gray-200 pt-10 text-center">
             <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.5em]">Koleksi Terbaru 2026</p>
          </div>
        </main>
      </div>
    </div>
  );
}
