"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://ecommerce-backend-production-aa2e.up.railway.app/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      const serverMessage = data.message ? data.message.toLowerCase() : "";

      // --- LOGIKA SESUAI URUTAN PERMINTAANMU ---

      // 1. CEK USER/EMAIL TERLEBIH DAHULU
      // Karena backend kirim 401, kita cek kata kunci di dalam pesannya
      if (
        res.status === 404 || 
        serverMessage.includes("user") || 
        serverMessage.includes("email") || 
        serverMessage.includes("not found")
      ) {
        setError("Email atau user belum terdaftar.");
        return; 
      }

      // 2. JIKA USER ADA, CEK PASSWORD
      if (
        res.status === 401 || 
        serverMessage.includes("password") || 
        serverMessage.includes("wrong")
      ) {
        setError("Password yang kamu masukkan salah.");
        return;
      }

      // 3. JIKA LOGIN BERHASIL (Status 200/OK)
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_session", JSON.stringify(data.user));

        alert(`Login Berhasil! Selamat datang ${data.user.name}`);

        // 4. CEK ROLE UNTUK REDIRECT
        if (data.user.role === "admin") {
          router.push("/admin/products"); //
        } else if (data.user.role === "customer") {
          router.push("/user"); //
        } else {
          router.push("/");
        }
      } else {
        setError(data.message || "Terjadi kesalahan pada sistem.");
      }

    } catch (err) {
      setError("Gagal terhubung ke server Backend");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <form onSubmit={handleLogin} className="p-10 bg-white shadow-2xl rounded-[2.5rem] w-full max-w-md border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">MyStore Login</h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Masuk ke akun Anda</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-100 animate-pulse">
            ⚠️ {error}
          </div>
        )}
        
        <div className="mb-5">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email</label>
          <input
            type="email"
            placeholder="contoh@mystore.com"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-10">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="w-full bg-[#0a0f1e] text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 active:scale-95 uppercase text-xs tracking-[0.2em]">
          Sign In
        </button>
      </form>
    </div>
  );
}
