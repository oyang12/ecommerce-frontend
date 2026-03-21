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

  // 🔥 POPUP STATE
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user_session');
      if (savedUser) setIsLoggedIn(true);
    }
  }, []);

  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://ecommerce-backend-production-aa2e.up.railway.app/api/products/${slug}`, { cache: 'no-store' });
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
      <p>Produk tidak ditemukan</p>
    </div>
  );

  // 🔥 HARGA
  const price = Number(product.price) || 0;
  const discountPercent = Number(product.disc) || 0;
  const hasDiscount = discountPercent > 0;
  const finalPrice = hasDiscount ? price - (price * discountPercent / 100) : price;

  // 🔥 ADD TO CART
  const addToCart = () => {
    if (!isLoggedIn) {
      alert("Silakan login terlebih dahulu");
      window.location.href = "/login";
      return;
    }

    const userSession = JSON.parse(localStorage.getItem("user_session"));
    const key = `cart_${userSession.id}`;

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

    // 🔥 tampilkan popup
    setShowPopup(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

        <img
          src={activeImage ? `${STORAGE_URL}${activeImage}` : ""}
          className="w-full max-w-md rounded mb-4"
        />

        <p className="text-xl font-bold mb-4">
          Rp {Math.floor(finalPrice).toLocaleString('id-ID')}
        </p>

        <button
          onClick={addToCart}
          disabled={product.stock <= 0}
          className={`w-full py-4 rounded-xl font-bold ${
            isLoggedIn ? "bg-blue-600 text-white" : "bg-yellow-500 text-white"
          }`}
        >
          {isLoggedIn ? "Tambah ke Cart" : "Login untuk Memesan"}
        </button>

      </div>

      {/* 🔥 POPUP */}
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
