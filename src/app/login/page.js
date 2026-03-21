"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://ecommerce-backend-production-aa2e.up.railway.app/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // ✅ LOGIN BERHASIL
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_session", JSON.stringify(data.user));
        window.dispatchEvent(new Event("authChanged"));

        // Redirect sesuai role
        if (data.user.role === "admin") {
          router.push("/admin/products");
        } else {
          router.push("/user");
        }

        return;
      }

      // ❌ EMAIL TIDAK TERDAFTAR
      if (res.status === 404) {
        setError("Email atau user belum terdaftar.");
      }

      // ❌ PASSWORD SALAH
      else if (res.status === 401) {
        setError("Password yang kamu masukkan salah.");
      }

      // ❌ ERROR LAIN
      else {
        setError(data.message || "Terjadi kesalahan pada sistem.");
      }

    } catch (err) {
      setError("Gagal terhubung ke server Backend");
    } finally {
      setLoading(false);
    }
  };


  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <form onSubmit={handleLogin} className="p-10 bg-white shadow-2xl rounded-[2.5rem] w-full max-w-md border border-gray-100">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
            MyStore Login
          </h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Masuk ke akun Anda
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-100">
            ⚠️ {error}
          </div>
        )}

        {/* EMAIL */}
        <div className="mb-5">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
            Email
          </label>
          <input
            type="email"
            placeholder="contoh@mystore.com"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-10">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0a0f1e] text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 active:scale-95 uppercase text-xs tracking-[0.2em] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>

      </form>
    </div>
  );
}
