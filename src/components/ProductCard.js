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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group hover:shadow-xl transition-all duration-300 flex flex-col">
      
      {/* BADGE STATUS (DRAFT/HIDDEN) */}
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

      {/* THUMBNAIL IMAGE */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <img 
          src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : FALLBACK_IMG} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          alt={p.name}
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>

      {/* CONTENT */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-2">
          <h3 className="font-bold text-gray-800 uppercase truncate text-sm tracking-tight">
            {p.name}
          </h3>
        </div>

        {/* INFO HARGA & STOK - Tanpa Border Atas */}
        <div className="mt-auto flex justify-between items-end pt-3">
          <div className="flex flex-col">
            {/* Harga Asli (Coret) */}
            {hasDiscount ? (
              <span className="text-gray-400 text-[10px] line-through leading-none mb-1">
                Rp {price.toLocaleString('id-ID')}
              </span>
            ) : null}
            {/* Harga Final */}
            <span className="text-blue-600 font-black text-lg leading-none">
              Rp {Math.floor(finalPrice).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="text-right">
            <div className={`text-[10px] font-bold uppercase ${
              p.stock === 0 ? 'text-red-600' : p.stock <= 20 ? 'text-yellow-500' : 'text-gray-400'
            }`}>
              Stok: {p.stock}
            </div>
          </div>
        </div>
      </div>

      {/* BUTTON ACTION - Garis border-t dihapus */}
      <div className="p-4 flex gap-2 pt-0">
        <Link 
          href={`/product/${p.slug}`} 
          className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-95"
        >
          Detail
        </Link>
        
        <button className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
          Beli
        </button>
      </div>
    </div>
  );
}
