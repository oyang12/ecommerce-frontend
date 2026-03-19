'use client'; 

import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-50"></div>
        <p className="mt-4 text-gray-500 font-semibold tracking-wide">Menyiapkan Koleksi Terbaik...</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-black">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION - Meniru gaya Admin */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Produk Kami</h1>
            <p className="text-gray-500 mt-1">Temukan produk impian Anda dengan kualitas terbaik.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
             <span className="text-blue-600 font-bold">{products.length}</span> 
             <span className="text-gray-500 ml-1 font-medium text-sm">Produk Tersedia</span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-400 text-lg font-medium">Belum ada produk untuk ditampilkan saat ini.</p>
          </div>
        ) : (
          /* GRID SECTION - Menyesuaikan gap dan layout admin */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
