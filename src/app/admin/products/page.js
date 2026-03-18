"use client";
import { useEffect, useState } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State lengkap untuk semua field
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    stock: "",
    description: "",
    image: null // Untuk menyimpan file gambar
  });

  const API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/products";

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_URL, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const result = await res.json();
    setProducts(result.data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fungsi otomatis buat slug dari nama (Contoh: "Sepatu Keren" -> "sepatu-keren")
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    // PAKAI FormData agar bisa kirim file gambar
    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("slug", formData.slug);
    dataToSend.append("price", formData.price);
    dataToSend.append("stock", formData.stock);
    dataToSend.append("description", formData.description);
    if (formData.image) {
      dataToSend.append("image", formData.image);
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
          // JANGAN set Content-Type manual kalau pakai FormData, browser akan mengaturnya otomatis
        },
        body: dataToSend
      });

      if (res.ok) {
        alert("Produk & Gambar Berhasil Ditambah!");
        setShowModal(false);
        setFormData({ name: "", slug: "", price: "", stock: "", description: "", image: null });
        fetchProducts();
      } else {
        const errData = await res.json();
        alert("Gagal: " + JSON.stringify(errData.errors));
      }
    } catch (err) {
      alert("Error koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk MyStore</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition shadow-lg"
          >
            + Tambah Produk Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b text-gray-600 uppercase text-sm">
                <th className="p-4 text-left">Produk</th>
                <th className="p-4 text-left">Slug</th>
                <th className="p-4 text-left">Stok</th>
                <th className="p-4 text-left">Harga</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-gray-500 text-sm">{p.slug}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4 font-semibold text-blue-600">Rp {Number(p.price).toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <button className="text-blue-500 hover:text-blue-700 mx-2">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 mx-2">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6">Input Data Produk</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Produk</label>
                <input type="text" required className="w-full border p-2 rounded-lg"
                  value={formData.name} onChange={handleNameChange} placeholder="Contoh: Sepatu Sneakers" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-500">Slug (Otomatis)</label>
                <input type="text" readOnly className="w-full border p-2 rounded-lg bg-gray-50"
                  value={formData.slug} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Harga (Rp)</label>
                  <input type="number" required className="w-full border p-2 rounded-lg"
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stok</label>
                  <input type="number" required className="w-full border p-2 rounded-lg"
                    value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                <textarea className="w-full border p-2 rounded-lg" rows="3"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-blue-600">Upload Gambar Produk</label>
                <input type="file" accept="image/*" className="w-full border p-1 rounded-lg text-sm"
                  onChange={(e) => setFormData({...formData, image: e.target.files[0]})} />
                <p className="text-[10px] text-gray-400 mt-1">*Format: JPG, PNG, WEBP (Maks 2MB)</p>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Batal</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400">
                  {loading ? "Proses..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
