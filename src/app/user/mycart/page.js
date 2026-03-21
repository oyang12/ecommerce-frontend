"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";

export default function MyCartPage() {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([]);

  // FORMAT RUPIAH
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID").format(num);

  // LOAD CART
  useEffect(() => {
    if (!user) return;

    const data = localStorage.getItem(`cart_${user.id}`);
    if (data) {
      const parsed = JSON.parse(data);
      setCart(parsed);
      setSelected(parsed.map((i) => i.id)); // default semua ke select
    }
  }, [user]);

  // SAVE
  const saveCart = (updated) => {
    setCart(updated);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updated));
  };

  // SELECT ITEM
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // SELECT ALL
  const toggleAll = () => {
    if (selected.length === cart.length) {
      setSelected([]);
    } else {
      setSelected(cart.map((i) => i.id));
    }
  };

  // QTY
  const increaseQty = (id) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    saveCart(updated);
  };

  const decreaseQty = (id) => {
    const updated = cart
      .map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item
      )
      .filter((item) => item.qty > 0);

    saveCart(updated);
  };

  // REMOVE
  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
    setSelected((prev) => prev.filter((i) => i !== id));
  };

  // CLEAR
  const clearCart = () => {
    saveCart([]);
    setSelected([]);
  };

  // TOTAL SELECTED
  const total = cart
    .filter((item) => selected.includes(item.id))
    .reduce((acc, item) => acc + item.price * item.qty, 0);

  if (!user) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">🛒 My Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 border rounded-xl">
          <p className="text-gray-500 text-lg">Keranjang kamu kosong 😢</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {/* LEFT - CART */}
          <div className="md:col-span-2 space-y-4">

            {/* SELECT ALL */}
            <div className="flex items-center justify-between border p-4 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.length === cart.length}
                  onChange={toggleAll}
                />
                Pilih Semua
              </label>

              <button
                onClick={clearCart}
                className="text-red-500 text-sm"
              >
                Hapus Semua
              </button>
            </div>

            {/* ITEMS */}
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border p-4 rounded-xl hover:shadow transition"
              >
                {/* CHECK */}
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />

                {/* IMAGE */}
                <img
                  src={item.image}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                {/* INFO */}
                <div className="flex-1">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-gray-500 text-sm">
                    Rp {formatRupiah(item.price)}
                  </p>

                  {/* QTY */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="w-8 h-8 border rounded"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="w-8 h-8 border rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* SUBTOTAL */}
                <div className="text-right">
                  <p className="font-semibold">
                    Rp {formatRupiah(item.price * item.qty)}
                  </p>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 text-sm mt-2"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT - SUMMARY */}
          <div className="border rounded-xl p-5 h-fit sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Ringkasan</h2>

            <div className="flex justify-between mb-2">
              <span>Total Item</span>
              <span>{selected.length}</span>
            </div>

            <div className="flex justify-between mb-4">
              <span>Total Harga</span>
              <span className="font-bold">
                Rp {formatRupiah(total)}
              </span>
            </div>

            <button
              onClick={() => alert("Next step: checkout 🚀")}
              disabled={selected.length === 0}
              className={`w-full py-3 rounded-lg text-white transition ${
                selected.length === 0
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Checkout
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
