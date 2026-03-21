'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const { user, openLogin } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  // 🔥 FETCH DATA
  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `https://ecommerce-backend-production-aa2e.up.railway.app/api/products/${slug}`,
          { cache: 'no-store' }
        );

        const result = await res.json();

        if (result.data) {
          setProduct(result.data);
          setActiveImage(
            result.data.thumbnail ||
            result.data.images?.[0]?.image
          );
        }
      } catch (err) {
        console.error("Gagal memuat detail produk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-900 border-opacity-50"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Produk tidak ditemukan</p>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const discountPercent = Number(product.disc) || 0;
  const hasDiscount = discountPercent > 0;

  const finalPrice = hasDiscount
    ? price - (price * discountPercent / 100)
    : price;

  // 🔥 HANDLE ORDER (FIX REDIRECT ONLY)
  const handleOrder = () => {
    if (!user) {
      openLogin({ redirect: window.location.pathname }); // 🔥 redirect balik sini
      return;
    }

    const key = `cart_${user.id}`;

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
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-6xl mx-auto">

        <button
          onClick={() => window.history.back()}
          className="mb-8 text-sm text-gray-500"
        >
          ← Kembali
        </button>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* IMAGE */}
          <div>
            <img
              src={
                activeImage
                  ? `${STORAGE_URL}${activeImage}`
                  : "https://via.placeholder.com/600"
              }
              className="w-full rounded-xl"
            />
          </div>

          {/* INFO */}
          <div>
            <h1 className="text-3xl font-bold mb-4">
              {product.name}
            </h1>

            {hasDiscount && (
              <p className="text-gray-400 line-through">
                Rp {price.toLocaleString("id-ID")}
              </p>
            )}

            <p className="text-blue-600 text-2xl font-bold mb-4">
              Rp {Math.floor(finalPrice).toLocaleString("id-ID")}
            </p>

            <p className="text-gray-600 mb-6">
              {product.description}
            </p>

            <button
              onClick={handleOrder}
              disabled={product.stock <= 0}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              {user ? "Tambah ke Cart" : "Login untuk Beli"}
            </button>
          </div>

        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center">
            <p className="mb-4">Berhasil masuk cart 🛒</p>

            <div className="flex gap-2">
              <button onClick={() => setShowPopup(false)}>
                Lanjut
              </button>

              <button
                onClick={() => window.location.href = "/user/mycart"}
                className="bg-blue-600 text-white px-3 py-2 rounded"
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
