'use client'; 

import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product: p }) {
  // Samakan URL Storage dengan yang kita gunakan sebelumnya
  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      {/* BAGIAN GAMBAR */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={
            p.thumbnail 
              ? `${STORAGE_URL}${p.thumbnail}`
              : p.image 
                ? `${STORAGE_URL}${p.image}`
                : "https://via.placeholder.com/400x300?text=No+Image"
          } 
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://via.placeholder.com/400x300?text=Image+Error";
          }}
        />
        {/* Badge Stok */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
            p.stock > 0 ? 'bg-white/90 text-blue-600' : 'bg-red-100 text-red-600'
          }`}>
            {p.stock > 0 ? `Stok: ${p.stock}` : 'Habis'}
          </span>
        </div>
      </div>

      {/* KONTEN TEXT */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
          {p.name}
        </h3>
        <p className="text-blue-600 font-black text-xl mt-2">
          Rp {Number(p.price).toLocaleString('id-ID')}
        </p>
        <p className="text-gray-400 text-sm mt-2 line-clamp-2 italic flex-grow">
          {p.description || "Sentuhan estetika untuk koleksi harian Anda."}
        </p>
      </div>

      {/* ACTION BUTTON */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <Link 
          href={`/products/${p.slug || p.id}`}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
