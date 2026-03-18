'use client'; 

import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pastikan fetchProducts mengambil array dari result.data 
    // karena Laravel Resource/JSON biasanya membungkus data dalam key 'data'
    fetchProducts().then((res) => {
      // Logic: Jika res adalah object yang punya property data, ambil res.data
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
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600 font-medium">Memuat produk...</p>
      </div>
    );

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Produk Kami</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {products.length} Items Found
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg italic">Wah, sepertinya belum ada produk yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
