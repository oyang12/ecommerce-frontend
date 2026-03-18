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

      if (res.ok) {
        // Simpan token untuk CRUD nanti
        localStorage.setItem("token", data.token);
        alert("Login Berhasil!");
        router.push("/"); // Pindah ke home
      } else {
        setError(data.message || "Email atau password salah");
      }
    } catch (err) {
      setError("Gagal terhubung ke server Backend");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-600">MyStore Login</h2>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm border border-red-100">{error}</div>}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email Admin</label>
          <input
            type="email"
            placeholder="admin@gmail.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg shadow-blue-200">
          Sign In
        </button>
      </form>
    </div>
  );
}
