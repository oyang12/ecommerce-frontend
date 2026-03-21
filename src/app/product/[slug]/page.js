"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function ProductDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://ecommerce-backend-production-aa2e.up.railway.app/api/products/${slug}`, { cache: "no-store" });
        const result = await res.json();

        if (result.data) {
          setProduct(result.data);
          setActiveImage(result.data.thumbnail || result.data.images?.[0]?.image);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (loading) return <p className="p-10 text-center">Loading...</p>;
  if (!product) return <p className="p-10 text-center">Produk tidak ditemukan</p>;

  const price = Number(product.price) || 0;
  const discount = Number(product.disc) || 0;
  const finalPrice = discount > 0 ? price - (price * discount / 100) : price;

  // 🔥 ADD TO CART
  const addToCart = () => {
    if (!user) {
      alert("Login dulu!");
      router.push("/login");
      return;
    }

    const key = `cart_${user.id}`;
    const existing = localStorage.getItem(key);
    let cart = existing ? JSON.parse(existing) : [];

    const found = cart.find((item) => item.id === product.id);

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
    <div className="p-6 max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

      <img
        src={activeImage ? `${STORAGE_URL}${activeImage}` : ""}
        className="w-full max-w-md rounded mb-4"
      />

      <p className="mb-2">Rp {Math.floor(finalPrice).toLocaleString()}</p>

      <button
        onClick={addToCart}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Tambah ke Cart
      </button>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center w-80">
            <h2 className="font-bold mb-2">Berhasil!</h2>
            <p className="mb-4">Produk masuk ke cart 🛒</p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 border py-2 rounded"
              >
                Lanjut
              </button>

              <button
                onClick={() => router.push("/user/mycart")}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
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
