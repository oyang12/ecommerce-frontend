'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug; 
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  // 🔥 STATE LOGIN (INI YANG PENTING)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  // 🔥 CEK LOGIN DARI TOKEN
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

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

  const price = Number(product.price) || 0;
  const discountPercent = Number(product.disc) || 0; 
  const hasDiscount = discountPercent > 0;
  const finalPrice = hasDiscount ? price - (price * discountPercent / 100) : price;

  // 🔥 HANDLE BUTTON (FINAL LOGIC)
  const handleOrder = () => {
    const token = localStorage.getItem("token");

    // ❌ BELUM LOGIN
    if (!token) {
      window.dispatchEvent(new Event("openLogin"));
      return;
    }

    // ✅ SUDAH LOGIN → MASUK CART
    const userSession = JSON.parse(localStorage.getItem("user_session"));
    const key = `cart_${userSession?.id}`;

    const existing = localStorage.getItem(key);
    let cart = existing ? JSON.parse(existing) : [];

    const found = cart.find(item => item.id === product.id);

    if (found) {
      found.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Math.floor(finalPrice),
        image: product.thumbnail 
          ? `${STORAGE_URL}${product.thumbnail}` 
          : "https://via.placeholder.com/300",
        qty: 1,
      });
    }

    localStorage.setItem(key, JSON.stringify(cart));

    setShowPopup(true);
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
          
          {/* GALLERY */}
          <div className="relative space-y-4">
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                -{discountPercent}%
              </div>
            )}

            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
              <img 
                src={activeImage ? `${STORAGE_URL}${activeImage}` : "https://via.placeholder.com/600x600"} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* INFO */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-black mb-4">{product.name}</h1>

            <p className="text-3xl font-black text-blue-600 mb-6">
              Rp {Math.floor(finalPrice).toLocaleString('id-ID')}
            </p>

            {/* 🔥 BUTTON DINAMIS */}
            <button 
              onClick={handleOrder}
              disabled={product.stock <= 0}
              className="w-full bg-[#0a0f1e] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 transition-all"
            >
              {isLoggedIn ? "Tambah ke Cart" : "Login untuk Beli"}
            </button>
          </div>

        </div>
      </div>

      {/* 🔥 POPUP SUCCESS */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-xl">
            <h2 className="text-lg font-bold mb-2">Berhasil!</h2>
            <p className="text-gray-600 mb-6">
              Produk sudah masuk ke cart 🛒
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Lanjut Belanja
              </button>

              <button
                onClick={() => window.location.href = "/user/mycart"}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
              >
                Lihat Cart
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
