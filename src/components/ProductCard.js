'use client';

import Link from 'next/link'; // Import Link agar bisa diklik

export default function ProductCard({ p }) {
  // CONFIGURATION GAMBAR SAMA DENGAN SEBELUMNYA
  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";
  const FALLBACK_IMG = "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group hover:shadow-xl transition-all duration-300">
      
      {/* BADGE STATUS - STYLE SAMA */}
      {p.status !== "Active" && (
        <div className="absolute top-4 right-4 z-30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm bg-gray-100 text-gray-500 border border-gray-200">
          {p.status}
        </div>
      )}

      {/* THUMBNAIL IMAGE - STYLE SAMA */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <img 
          src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : FALLBACK_IMG} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          alt={p.name}
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-100 to-transparent"></div>
      </div>

      {/* CONTENT - STYLE SAMA */}
      <div className="p-5 pb-0">
        <h3 className="font-bold text-gray-800 uppercase truncate text-sm">{p.name}</h3>
        
        {/* DESKRIPSI - STYLE SAMA (line-clamp-2) */}
        <p className="text-gray-400 text-[11px] mt-1 line-clamp-2 leading-relaxed h-[32px]">
          {p.description || "Tidak ada deskripsi produk."}
        </p>

        <div className="flex justify-between items-end mt-4">
          <p className="text-blue-600 font-black text-lg">
            Rp {Number(p.price).toLocaleString('id-ID')}
          </p>
          <span className={`text-[10px] font-bold uppercase ${
            p.stock === 0 ? 'text-red-600' : p.stock <= 20 ? 'text-yellow-500' : 'text-gray-400'
          }`}>
            Stok: {p.stock}
          </span>
        </div>
      </div>

      {/* BUTTON ACTION - STYLE SAMA, FUNGSI KLIK DITAMBAHKAN */}
      <div className="p-4 bg-gray-50 border-t flex gap-2 mt-4 pt-4 border-gray-100">
        {/* TOMBOL DETAIL: Sekarang menggunakan Link ke slug produk, tapi visualnya sama */}
        <Link 
          href={`/product/${p.slug}`} 
          className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest text-center shadow-sm active:scale-95"
        >
          Detail
        </Link>
        
        {/* TOMBOL BELI: Visual sama, bisa kamu tambahkan fungsi onClick nanti */}
        <button className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-blue-600 transition-all uppercase tracking-widest shadow-lg active:scale-95">
          Beli
        </button>
      </div>
    </div>
  );
}
