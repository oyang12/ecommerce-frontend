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

  // 🔐 PROTECT FIX
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

  const selectedItems = cart.filter((item) =>
    selected.includes(item.id)
  );

  const total = selectedItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const handleCheckout = () => {
    let message = "Halo, saya ingin order:\n\n";

    selectedItems.forEach((item, i) => {
      const subtotal = item.price * item.qty;

      message += `${i + 1}. ${item.name}\n`;
      message += `Harga: Rp ${formatRupiah(item.price)}\n`;
      message += `Qty: ${item.qty}\n`;
      message += `Subtotal: Rp ${formatRupiah(subtotal)}\n\n`;
    });

    message += `Total: Rp ${formatRupiah(total)}`;

    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (checkingAuth) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Cart</h1>

      {cart.map((item) => (
        <div key={item.id} className="border p-3 mt-3">
          {item.name} - {item.qty}
        </div>
      ))}

      <button
        onClick={handleCheckout}
        className="mt-5 bg-green-600 text-white px-4 py-2"
      >
        Checkout WA
      </button>
    </div>
  );
}
