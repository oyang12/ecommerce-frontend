'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug; 
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
      // Cek status login saat komponen mount
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user_session');
        if (savedUser) {
          setIsLoggedIn(true);
        }
      }
    }, []);
    
    // Modifikasi fungsi handleOrder
    const handleOrder = () => {
      if (!isLoggedIn) {
        alert("Silakan login terlebih dahulu untuk memesan produk.");
        window.location.href = '/login'; // Arahkan ke halaman login
        return;
      }
    
      const message = `Halo Admin, saya tertarik dengan produk *${product.name}*...`;
      window.open(`https://wa.me/628123456789?text=${encodeURIComponent(message)}`, '_blank');
    };        


  
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
  
  // --- LOGIKA PERHITUNGAN HARGA ---
  const price = Number(product.price) || 0;
  // Pastikan mengambil field 'disc' atau 'discount' sesuai API
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
            {/* Badge Diskon Mengambang di Foto (Opsional, seperti di gambar referensi) */}
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                -{discountPercent}%
              </div>
            )}

            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm group">
              <img 
                src={activeImage ? `${STORAGE_URL}${activeImage}` : "https://via.placeholder.com/600x600?text=No+Image"} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {product.thumbnail && (
                <button 
                  onClick={() => setActiveImage(product.thumbnail)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === product.thumbnail ? 'border-gray-900 shadow-md scale-95' : 'border-transparent opacity-50 hover:opacity-100'}`}
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
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === img.image ? 'border-gray-900 shadow-md scale-95' : 'border-transparent opacity-50 hover:opacity-100'
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">
              {product.category || "Original Collection"}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase leading-tight tracking-tighter mb-4">
              {product.name}
            </h1>
            
            <div className="flex flex-col mb-8">
              {/* Baris Harga Utama & Stok */}
              <div className="flex items-end justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  {hasDiscount && (
                    <p className="text-xs font-bold text-gray-400 line-through mb-1">
                      Rp {price.toLocaleString('id-ID')}
                    </p>
                  )}
                  <p className="text-4xl font-black text-blue-600">
                    Rp {Math.floor(finalPrice).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  {hasDiscount && (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter mb-1">
                      Disc {discountPercent}%
                    </p>
                  )}
                  <p className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                    Stok: {product.stock}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Deskripsi Produk</h3>
                <p className="text-gray-600 leading-relaxed italic text-sm md:text-base whitespace-pre-line">
                  {product.description || "Produk ini belum memiliki deskripsi detail."}
                </p>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleOrder}
                  disabled={product.stock <= 0}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:bg-gray-300
                    ${isLoggedIn 
                      ? 'bg-[#0a0f1e] text-white hover:bg-blue-700' 
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                >
                  {isLoggedIn ? "Pesan Sekarang (WhatsApp)" : "Login untuk Memesan"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
