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

  // --- LOGIKA HARGA & DISKON (SESUAI PRODUCT CARD) ---
  const price = Number(product.price) || 0;
  const discountPercent = Number(product.disc) || 0; 
  const hasDiscount = discountPercent > 0;
  const finalPrice = hasDiscount ? price - (price * discountPercent / 100) : price;

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
            {/* Badge Diskon Mengambang */}
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-xl animate-bounce">
                -{discountPercent}% OFF
              </div>
            )}

            <div className="aspect-square bg-white rounded-[40px] overflow-hidden border border-gray-200 shadow-sm group">
              <img 
                src={activeImage ? `${STORAGE_URL}${activeImage}` : FALLBACK_IMG} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {product.thumbnail && (
                <button 
                  onClick={() => setActiveImage(product.thumbnail)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === product.thumbnail ? 'border-gray-900 shadow-md scale-95' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img src={`${STORAGE_URL}${product.thumbnail}`} className="w-full h-full object-cover" alt="main-thumb" />
                </button>
              )}

              {product.images && product.images
                .filter(img => img.image !== product.thumbnail)
                .map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img.image)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === img.image ? 'border-gray-900 shadow-md scale-95' : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    <img src={`${STORAGE_URL}${img.image}`} className="w-full h-full object-cover" alt={`gallery-${idx}`} />
                  </button>
                ))
              }
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
                {product.category || "Original Product"}
              </span>
              {product.status !== "Active" && (
                <span className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  {product.status}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase leading-none tracking-tighter mb-6">
              {product.name}
            </h1>
            
            <div className="flex flex-col mb-10">
              <div className="flex items-end justify-between gap-3 border-b border-dashed border-gray-200 pb-8">
                <div>
                  {hasDiscount && (
                    <p className="text-sm font-bold text-gray-400 line-through mb-1">
                      Rp {price.toLocaleString('id-ID')}
                    </p>
                  )}
                  <p className="text-5xl font-black text-blue-600 tracking-tighter">
                    Rp {Math.floor(finalPrice).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl ${
                    product.stock === 0 ? 'bg-red-50 text-red-600' : 
                    product.stock <= 20 ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    STOK: {product.stock}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Product Story</h3>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                  {product.description || "No description available for this item."}
                </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleOrder}
                  disabled={product.stock <= 0}
                  className="w-full bg-gray-900 text-white py-6 rounded-[30px] font-black uppercase text-sm tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl hover:shadow-blue-200 active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                >
                  <span>Pesan via WhatsApp</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
