'use client';

import Link from 'next/link';

export default function ProductCard({ p }) {
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
            return <span key={i}>⭐</span>; // bisa upgrade jadi half star nanti
          } else {
            return <span key={i} className="opacity-20">⭐</span>;
          }
        })}
      </div>
    );
  };

  return (
    <Link href={`/product/${p.slug}`} className="block group">
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden relative hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
        
        {/* BADGE STATUS */}
        {p.status !== "Active" && (
          <div className="absolute top-4 right-4 z-30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm bg-gray-100 text-gray-500 border border-gray-200">
            {p.status}
          </div>
        )}

        {/* BADGE DISKON */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-30 bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase shadow-md">
            -{discountPercent}%
          </div>
        )}

        {/* IMAGE */}
        <div className="aspect-square overflow-hidden bg-gray-50 relative">
          <img 
            src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : FALLBACK_IMG} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt={p.name}
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
        </div>

        {/* CONTENT */}
        <div className="p-6 flex-grow flex flex-col">
          
          <div className="mb-3">
            <h3 className="font-black text-gray-900 uppercase truncate text-sm tracking-tight group-hover:text-blue-600 transition-colors">
              {p.name}
            </h3>

            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {p.category || "Collection"}
            </p>

            {/* ⭐ RATING */}
            <div className="flex items-center justify-between mt-2">
              {renderStars(p.rating || 0)}
              <span className="text-[10px] text-gray-400 font-bold">
                {p.rating ? p.rating.toFixed(1) : "0.0"}
              </span>
            </div>

          </div>

          {/* HARGA & STOK */}
          <div className="mt-auto flex justify-between items-end border-t border-gray-50 pt-4">
            
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-gray-400 text-[10px] font-bold line-through leading-none mb-1">
                  Rp {price.toLocaleString('id-ID')}
                </span>
              )}

              <span className="text-blue-600 font-black text-xl leading-none">
                Rp {Math.floor(finalPrice).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="text-right">
              <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-opacity-10 ${
                p.stock === 0 ? 'text-red-600 bg-red-100' 
                : p.stock <= 20 ? 'text-yellow-600 bg-yellow-100' 
                : 'text-gray-400 bg-gray-100'
              }`}>
                Stok: {p.stock}
              </div>
            </div>

          </div>

        </div>
      </div>
    </Link>
  );
}
