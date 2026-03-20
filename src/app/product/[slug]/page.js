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
  const FALLBACK_IMG = "https://via.placeholder.com/600x600?text=No+Image";

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      const API_URL = `https://ecommerce-backend-production-aa2e.up.railway.app/api/products/${slug}`;
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        const result = await res.json();
        if (result.data) {
          setProduct(result.data);
          setActiveImage(result.data.thumbnail || (result.data.images?.[0]?.image));
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

  // --- LOGIKA HARGA & DISKON (DIADAPTASI DARI PRODUCT CARD) ---
  const price = Number(product.price) || 0;
  const discountPercent = Number(product.disc) || 0; 
  const hasDiscount = discountPercent > 0;
  
  // Perhitungan harga akhir (Math.floor digunakan agar sama dengan tampilan katalog)
  const finalPrice = hasDiscount 
    ? price - (price * discountPercent / 100) 
    : price;

  const handleOrder = () => {
    const message = `Halo Admin, saya tertarik dengan produk *${product.name}* (Harga: Rp ${Math.floor(finalPrice).toLocaleString('id-ID')}). Apakah stok masih tersedia?`;
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
          <div className="relative space-y-4">
            {/* BADGE DISKON MENGAMBANG (Sama seperti Admin/Card) */}
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[12px] font-black px-4 py-2 rounded-xl shadow-xl animate-pulse">
                -{discountPercent}% OFF
              </div>
            )}

            <div className="aspect-square bg-white rounded-[40px] overflow-hidden border border-gray-200 shadow-sm">
              <img 
                src={activeImage ? `${STORAGE_URL}${activeImage}` : FALLBACK_IMG} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700"
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
            </div>
            
            {/* THUMBNAILS */}
            <div className="grid grid-cols-4 gap-4">
              {product.thumbnail && (
                <button onClick={() => setActiveImage(product.thumbnail)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === product.thumbnail ? 'border-gray-900' : 'border-transparent opacity-50'}`}>
                  <img src={`${STORAGE_URL}${product.thumbnail}`} className="w-full h-full object-cover" alt="thumb" />
                </button>
              )}
              {product.images?.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(img.image)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img.image ? 'border-gray-900' : 'border-transparent opacity-50'}`}>
                  <img src={`${STORAGE_URL}${img.image}`} className="w-full h-full object-cover" alt="thumb" />
                </button>
              ))}
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase leading-none tracking-tighter mb-6">
              {product.name}
            </h1>
            
            <div className="flex flex-col mb-10 border-b border-dashed border-gray-200 pb-8">
              {/* HARGA AREA */}
              <div className="flex flex-col">
                {hasDiscount && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-gray-400 line-through">
                      Rp {price.toLocaleString('id-ID')}
                    </span>
                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">
                      Hemat {discountPercent}%
                    </span>
                  </div>
                )}
                <p className="text-6xl font-black text-blue-600 tracking-tighter">
                  Rp {Math.floor(finalPrice).toLocaleString('id-ID')}
                </p>
              </div>

              {/* STOK INFO */}
              <div className="mt-4">
                <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${
                  product.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  Stok Tersedia: {product.stock}
                </span>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Deskripsi</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description || "Tidak ada deskripsi produk."}
                </p>
              </div>

              <button 
                onClick={handleOrder}
                disabled={product.stock <= 0}
                className="w-full bg-gray-900 text-white py-6 rounded-[30px] font-black uppercase text-sm tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95 disabled:bg-gray-200"
              >
                {product.stock <= 0 ? "Stok Habis" : "Pesan via WhatsApp →"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
