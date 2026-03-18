"use client";
import { useEffect, useState } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); 
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    stock: "",
    description: "",
  });

  const API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/products";

  // 1. Ambil Data Produk
  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      // Pastikan mengambil result.data karena Laravel biasanya membungkusnya dalam .data
      setProducts(result.data || []); 
    } catch (err) {
      console.error("Gagal fetch:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Fungsi Hapus
  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus produk ini?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Produk berhasil dihapus!");
        fetchProducts();
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus.");
    }
  };

  // 3. Handle Nama & Slug Otomatis
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, name, slug });
  };

  // 4. Handle Simpan Produk (Tambah)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("slug", formData.slug);
    dataToSend.append("price", formData.price);
    dataToSend.append("stock", formData.stock);
    dataToSend.append("description", formData.description);

    // Kirim banyak foto ke images[]
    if (selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        dataToSend.append("images[]", selectedFiles[i]); 
      }
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: dataToSend
      });

      if (res.ok) {
        alert("Produk Berhasil Ditambah!");
        setShowModal(false);
        setFormData({ name: "", slug: "", price: "", stock: "", description: "" });
        setSelectedFiles([]); 
        fetchProducts();
      } else {
        const errData = await res.json();
        alert("Gagal: " + JSON.stringify(errData));
      }
    } catch (err) {
      alert("Error koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-black">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk MyStore</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition shadow-md"
          >
            + Tambah Produk Baru
          </button>
        </div>

        {/* TABEL PRODUK */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b text-gray-600 uppercase text-xs">
                <th className="p-4 text-left">Nama Produk</th>
                <th className="p-4 text-left">Slug</th>
                <th className="p-4 text-left">Stok</th>
                <th className="p-4 text-left">Harga</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{p.name}</td>
                    <td className="p-4 text-gray-500 text-sm">{p.slug}</td>
                    <td className="p-4 text-gray-700">{p.stock}</td>
                    <td className="p-4 font-semibold text-blue-600">
                      Rp {Number(p.price).toLocaleString()}
                    </td>
                    <td className="p-4 text-center flex justify-center gap-4">
                      <button className="text-blue-500 hover:underline font-medium">Edit</button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:underline font-medium"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">Belum ada produk.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH PRODUK */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Input Data Produk</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Produk</label>
                <input type="text" required className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  value={formData.name} onChange={handleNameChange} placeholder="Contoh: Sepatu Sneakers" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-500 text-xs italic">Slug (Otomatis)</label>
                <input type="text" readOnly className="w-full border p-2 rounded-lg bg-gray-100 text-gray-500"
                  value={formData.slug} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Harga (Rp)</label>
                  <input type="number" required className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stok</label>
                  <input type="number" required className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                <textarea className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" rows="3"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-blue-600">Upload Foto Produk</label>
                <input type="file" multiple accept="image/*" className="w-full border p-1 rounded-lg text-sm bg-blue-50 cursor-pointer"
                  onChange={(e) => setSelectedFiles(e.target.files)} />
                <p className="text-[10px] text-gray-400 mt-1">*Bisa pilih banyak foto sekaligus (Tahan Ctrl/Cmd)</p>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Batal</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition shadow-lg">
                  {loading ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
