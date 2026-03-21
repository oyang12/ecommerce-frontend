"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function MyCartPage() {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);

  // LOAD CART
  useEffect(() => {
    if (!user) return;

    const data = localStorage.getItem(`cart_${user.id}`);
    if (data) setCart(JSON.parse(data));
  }, [user]);

  // UPDATE LOCALSTORAGE
  const saveCart = (updated) => {
    setCart(updated);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updated));
  };

  // ➕ tambah qty
  const increaseQty = (id) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    saveCart(updated);
  };

  // ➖ kurang qty
  const decreaseQty = (id) => {
    const updated = cart
      .map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item
      )
      .filter((item) => item.qty > 0);

    saveCart(updated);
  };

  // 🗑 hapus 1 item
  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  // 🗑 clear semua
  const clearCart = () => {
    saveCart([]);
  };

  // 🧮 total
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (!user) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">My Cart</h1>

      {cart.length === 0 ? (
        <p>Cart kosong 😢</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border p-4 mb-3 rounded">

              <img src={item.image} className="w-20 h-20 object-cover rounded" />

              <div className="flex-1">
                <h2>{item.name}</h2>
                <p>Rp {item.price.toLocaleString()}</p>

                {/* QTY */}
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => decreaseQty(item.id)} className="px-2 bg-gray-200">-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => increaseQty(item.id)} className="px-2 bg-gray-200">+</button>
                </div>
              </div>

              <button onClick={() => removeItem(item.id)} className="text-red-500">
                Hapus
              </button>

            </div>
          ))}

          {/* TOTAL */}
          <div className="mt-6 text-right">
            <h2 className="text-xl font-bold">
              Total: Rp {total.toLocaleString()}
            </h2>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={clearCart}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Clear All
              </button>

              <button
                onClick={() => alert("Next: kirim ke backend 🚀")}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
