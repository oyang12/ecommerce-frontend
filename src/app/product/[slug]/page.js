'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug; 
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      const API_URL = `https://ecommerce-backend-production-aa2e.up.railway.app/api/products/${slug}`;
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        const result = await res.json();
        if (result.data) {
          setProduct(result.data);
          // Set thumbnail sebagai gambar utama di awal
          setActiveImage(result.data.thumbnail || (result.data.images?.[0]?.image_path));
        }
      } catch (err) {
        console.error("Gagal memuat detail produk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-900 border-opacity-50"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="font-black uppercase tracking-widest text-gray-400">Produk tidak ditemukan</p>
        <button onClick={() => window.history.back()} className="mt-4 text-xs font-bold text-blue-600 uppercase underline">Kembali ke Katalog</button>
      </div>
    </div>
  );

  const handleOrder = () => {
    const message = `Halo Admin, saya tertarik dengan produk *${product.name}* (Harga: Rp ${Number(product.price).toLocaleString('id-ID')}). Apakah stok masih tersedia?`;
    window.open(`https://wa.me/628123456789?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-black">
      <div className="max-w-6xl mx-auto">
        
        <button 
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"
        >
          ← Kembali ke Katalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* GALLERY SECTION */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm group">
              <img 
                src={activeImage ? `${STORAGE_URL}${activeImage}` : "https://via.placeholder.com/600x600?text=No+Image"} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {/* Thumbnail utama */}
                <button 
                  onClick={() => setActiveImage(product.thumbnail)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === product.thumbnail ? 'border-gray-900' : 'border-transparent opacity-50'}`}
                >
                  <img src={`${STORAGE_URL}${product.thumbnail}`} className="w-full h-full object-cover" alt="thumb" />
                </button>
                {/* List gambar tambahan */}
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img.image_path)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === img.image_path ? 'border-gray-900 shadow-md scale-95' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={`${STORAGE_URL}${img.image_path}`} className="w-full h-full object-cover" alt={`gallery-${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">
              {product.category || "Original Collection"}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase leading-tight tracking-tighter mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <p className="text-3xl font-black text-gray-900">
                Rp {Number(product.price).toLocaleString('id-ID')}
              </p>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                product.stock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {product.stock > 0 ? `Ready Stok: ${product.stock}` : 'Stok Habis'}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-8 space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Deskripsi Produk</h3>
                <p className="text-gray-600 leading-relaxed italic text-sm md:text-base">
                  {product.description || "Produk ini belum memiliki deskripsi detail."}
                </p>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleOrder}
                  disabled={product.stock <= 0}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Pesan Sekarang (WhatsApp)
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
