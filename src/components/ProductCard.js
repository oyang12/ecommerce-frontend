'use client';

import Link from 'next/link'; // Import Link untuk navigasi

export default function ProductCard({ p }) {
  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";
  const FALLBACK_IMG = "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group hover:shadow-xl transition-all duration-300">
      
      {/* Badge Status */}
      {p.status !== "Active" && (
        <div className="absolute top-4 right-4 z-30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm bg-gray-100 text-gray-500 border border-gray-200">
          {p.status}
        </div>
      )}

      {/* Thumbnail Image */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : FALLBACK_IMG} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          alt={p.name}
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>

      {/* Content */}
      <div className="p-5 pb-0">
        <h3 className="font-bold text-gray-800 uppercase truncate">{p.name}</h3>
        
        <p className="text-gray-400 text-[11px] mt-1 line-clamp-2 leading-relaxed h-[32px]">
          {p.description || "Tidak ada deskripsi produk."}
        </p>

        <div className="flex justify-between items-end mt-4">
          <p className="text-blue-600 font-black text-lg">
            Rp {Number(p.price).toLocaleString('id-ID')}
          </p>
          <span className={`text-[10px] font-bold uppercase ${p.stock < 5 ? 'text-orange-500' : 'text-gray-400'}`}>
            Stok: {p.stock}
          </span>
        </div>
      </div>

      {/* Action Buttons dengan Navigasi */}
      <div className="p-4 bg-gray-50 border-t flex gap-2 mt-4">
        {/* TOMBOL DETAIL: Sekarang menggunakan Link ke slug produk */}
        <Link 
          href={`/product/${p.slug}`} 
          className="flex-1 bg-white border border-gray-200 py-2 rounded-xl font-bold text-xs hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest text-center"
        >
          Detail
        </Link>
        
        <button className="flex-1 bg-gray-900 text-white py-2 rounded-xl font-bold text-xs hover:bg-blue-600 transition-all uppercase tracking-widest active:scale-95">
          Beli
        </button>
      </div>
    </div>
  );
}
