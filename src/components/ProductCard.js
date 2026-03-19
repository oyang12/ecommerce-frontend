'use client'; 

import Image from 'next/image';

export default function ProductCard({ product }) {
  // Gunakan thumbnail_url yang sudah kita buat di Laravel Accessor
  const displayImage = product.thumbnail_url;

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-xl transition-shadow bg-white flex flex-col h-full">
      <div className="relative w-full h-64 mb-4 bg-gray-100 rounded-lg overflow-hidden">
        {displayImage ? (
          <img
            src={product.image ? `https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/${product.image}` : "/no-image.png"}
            alt={product.name}
            className="w-full h-48 object-cover"
            // Tambahkan fallback jika URL gambar rusak
            onError={(e) => {
              e.target.src = 'https://placehold.co/600x400?text=Image+Error';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
            No Image
          </div>
        )}
      </div>

      <div className="flex-grow">
        <h2 className="font-bold text-lg text-gray-800 line-clamp-1">{product.name}</h2>
        <p className="text-blue-600 font-bold mt-1">
          Rp {Number(product.price).toLocaleString('id-ID')}
        </p>
      </div>
      
      <button className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition">
        Lihat Detail
      </button>
    </div>
  );
}
