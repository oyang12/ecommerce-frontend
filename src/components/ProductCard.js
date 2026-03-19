'use client'; 

import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug; 

  // TETAP GUNAKAN /products/ di sini karena ini alamat API Backend kamu
  const API_URL = `https://ecommerce-backend-production-aa2e.up.railway.app/api/products/${slug}`;
  
  // Storage juga biasanya pakai jamak (products)
  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* BAGIAN GAMBAR (Identik dengan Admin: Hover Zoom) */}
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
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://via.placeholder.com/400x300?text=Image+Error";
          }}
        />
        
        {/* Badge Stok (Gaya Minimalis) */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
            p.stock > 0 
              ? 'bg-white/90 text-green-700 border-green-100' 
              : 'bg-red-100 text-red-600 border-red-200'
          }`}>
            {p.stock > 0 ? `Stok: ${p.stock}` : 'Habis'}
          </span>
        </div>
      </div>

      {/* KONTEN TEXT (Identik dengan Admin) */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-bold text-gray-800 uppercase truncate group-hover:text-blue-600 transition-colors tracking-tight">
          {p.name}
        </h3>
        
        {/* Deskripsi (Fixed height & Line clamp 2 agar sejajar seperti Admin) */}
        <p className="text-gray-400 text-[11px] mt-1 line-clamp-2 leading-relaxed h-[32px]">
          {p.description || "Sentuhan estetika untuk koleksi harian Anda."}
        </p>

        <div className="flex justify-between items-end mt-auto pt-4">
          <p className="text-blue-600 font-black text-lg">
            Rp {Number(p.price).toLocaleString('id-ID')}
          </p>
          {/* Tambahan info kategori kecil jika ada */}
          <span className="text-[10px] font-bold uppercase text-gray-300">
            {p.category || "General"}
          </span>
        </div>
      </div>

      {/* ACTION BUTTON (Statik / Muncul Terus seperti permintaanmu) */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <Link 
          href={`/product/${p.slug || p.id}`}
          className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
