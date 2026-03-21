"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function MyCartPage() {
  const { user, loading, openLogin } = useAuth();

  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const PHONE = "6282153249401";

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID").format(num);

  // 🔐 PROTECT
  useEffect(() => {
    if (loading) return;

    if (!user) {
      openLogin({ redirect: "/user/mycart" });
    } else {
      setCheckingAuth(false);
    }
  }, [user, loading, openLogin]);

  // LOAD CART
  useEffect(() => {
    if (!user) return;

    const data = localStorage.getItem(`cart_${user.id}`);
    if (data) {
      const parsed = JSON.parse(data);
      setCart(parsed);
      setSelected(parsed.map((i) => i.id));
    }
  }, [user]);

  const saveCart = (updated) => {
    setCart(updated);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updated));
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

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
    setSelected((prev) => prev.filter((i) => i !== id));
  };

  const selectedItems = cart.filter((item) =>
    selected.includes(item.id)
  );

  const total = selectedItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  // WA
  const handleCheckout = () => {
    if (selectedItems.length === 0) return;

    let message = "Halo, saya ingin order:\n\n";

    selectedItems.forEach((item, i) => {
      const subtotal = item.price * item.qty;

      message += `${i + 1}. ${item.name}\n`;
      message += `Harga: Rp ${formatRupiah(item.price)}\n`;
      message += `Qty: ${item.qty}\n`;
      message += `Subtotal: Rp ${formatRupiah(subtotal)}\n\n`;
    });

    message += `Total: Rp ${formatRupiah(total)}\n`;
    message += `\nTerima kasih 🙏`;

    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (checkingAuth) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">🛒 My Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 border rounded-xl">
          <p className="text-gray-500 text-lg">Keranjang kosong 😢</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="md:col-span-2 space-y-4">

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border p-4 rounded-xl hover:shadow transition"
              >
                <img
                  src={item.image}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-gray-500 text-sm">
                    Rp {formatRupiah(item.price)}
                  </p>

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

          {/* RIGHT */}
          <div className="border rounded-xl p-5 h-fit sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Ringkasan</h2>

            <div className="flex justify-between mb-4">
              <span>Total</span>
              <span className="font-bold">
                Rp {formatRupiah(total)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Checkout via WhatsApp
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
