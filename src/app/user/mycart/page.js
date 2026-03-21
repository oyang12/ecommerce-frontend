"use client";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function MyCartPage() {
  const auth = useAuth();
  const user = auth?.user;
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // 🔥 Load cart dari localStorage
  useEffect(() => {
    if (!user) return;

    const storedCart = localStorage.getItem(`cart_${user.id}`);
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [user]);

  // 🔥 Hapus item
  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updated));
  };

  // 🔥 Hitung total
  const total = cart.reduce((acc, item) => {
    return acc + item.price * item.qty;
  }, 0);

  if (!user) {
    return <p className="p-10 text-center">Silakan login dulu</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Cart</h1>

      {cart.length === 0 ? (
        <p>Cart masih kosong 😢</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border p-4 rounded-lg"
              >
                <img
                  src={item.image}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex-1">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p>Rp {item.price.toLocaleString()}</p>
                  <p>Qty: {item.qty}</p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mt-6 text-right">
            <h2 className="text-xl font-bold">
              Total: Rp {total.toLocaleString()}
            </h2>

            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
