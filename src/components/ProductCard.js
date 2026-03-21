'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

export default function ProductCard({ p }) {
  const { openLogin } = useAuth();

  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";
  const FALLBACK_IMG = "https://via.placeholder.com/400x300?text=No+Image";

  // LOGIKA HARGA & DISKON
  const price = Number(p.price) || 0;
  const discountPercent = Number(p.disc) || 0;
  const hasDiscount = discountPercent > 0;
  
  const finalPrice = hasDiscount 
    ? price - (price * discountPercent / 100) 
    : price;

  // ⭐ FUNCTION RATING
  const renderStars = (rating = 0) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-[2px]">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <span key={i}>⭐</span>;
          } else if (i === fullStars && halfStar) {
            return <span key={i}>⭐</span>;
          } else {
            return <span key={i} className="opacity-20">⭐</span>;
          }
        })}
      </div>
    );
  };

  // 🔥 HANDLE BELI
  const handleBuy = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      openLogin(); // 🔥 munculin modal login
      return;
    }

    alert("Lanjut ke checkout"); // nanti sambung ke cart / checkout
  };

  return (
    <div className="relative group">

      {/* 🔥 OVERLAY LINK */}
      <Link
        href={`/product/${p.slug}`}
        className="absolute inset-0 z-10"
      />

      {/* CARD */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden relative hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
        
        {/* BADGE DISKON */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black">
            -{discountPercent}%
          </div>
        )}

        {/* IMAGE */}
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img 
            src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : FALLBACK_IMG} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            alt={p.name}
          />
        </div>

        {/* CONTENT */}
        <div className="p-6 flex flex-col flex-grow">
          
          <h3 className="font-black text-sm uppercase text-gray-900">
            {p.name}
          </h3>

          <span className="text-blue-600 font-black text-xl mt-2">
            Rp {Math.floor(finalPrice).toLocaleString('id-ID')}
          </span>

          {/* 🔥 BUTTON (DI ATAS LINK) */}
          <button
            onClick={handleBuy}
            className="relative z-20 mt-4 bg-black text-white py-3 rounded-xl text-xs font-black uppercase hover:bg-blue-600 transition-all"
          >
            Beli
          </button>

        </div>
      </div>
    </div>
  );
}
