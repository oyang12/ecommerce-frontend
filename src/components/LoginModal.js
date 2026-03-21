"use client";

import { useState } from "react";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://ecommerce-backend-production-aa2e.up.railway.app/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // 🔥 SIMPAN TOKEN
        localStorage.setItem("token", data.token);

        // 🔥 KIRIM KE PROVIDER (INI PENTING)
        onSuccess(data.user);

        return;
      }

      if (res.status === 404) {
        setError("Email atau user belum terdaftar.");
      } else if (res.status === 401) {
        setError("Password salah.");
      } else {
        setError(data.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      setError("Gagal konek ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md mx-4 animate-[fadeIn_.3s_ease]">

        <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[2.5rem] p-10">

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow hover:scale-110 transition"
          >
            ✕
          </button>

          {/* HEADER */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black tracking-tight text-gray-900">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mt-2">
              Login ke akun kamu
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full mt-2 p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-2 p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>

          </form>

          <div className="text-center mt-8">
            <p className="text-[11px] text-gray-400">
              Belum punya akun?{" "}
              <span className="text-blue-600 font-bold cursor-pointer hover:underline">
                Daftar
              </span>
            </p>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

    </div>
  );
}
