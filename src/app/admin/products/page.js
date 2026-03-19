"use client";
import { useEffect, useState, useRef } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    stock: "",
    description: "",
    status: "Active", // Default status
  });

  const API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/products";
  const IMAGE_API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/product-images";
  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  const fetchProducts = async () => {
    setFetchLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      setProducts(result.data || []); 
    } catch (err) {
      console.error("Gagal fetch:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // FITUR 4: Fungsi Toggle Status Cepat
  const toggleStatus = async (product) => {
    const newStatus = product.status === "Active" ? "Draft" : "Active";
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${API_URL}/${product.id}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          _method: "PUT",
          status: newStatus
        })
      });

      if (res.ok) {
        setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      alert("Gagal memperbarui status");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const updatedFiles = [...selectedFiles, ...files];
    setSelectedFiles(updatedFiles);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    e.target.value = null;
  };

  const handleRemovePreview = (indexToRemove) => {
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setPreviewUrls(previewUrls.filter((_, index) => index !== indexToRemove));
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Yakin mau hapus produk ini?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Produk berhasil dihapus!");
        setSelectedProductIds(prev => prev.filter(item => item !== id));
        fetchProducts();
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Yakin ingin menghapus ${selectedProductIds.length} produk terpilih?`)) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const deletePromises = selectedProductIds.map(id => 
        fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        })
      );
      await Promise.all(deletePromises);
      alert("Produk terpilih berhasil dihapus!");
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err) {
      alert("Gagal menghapus beberapa produk.");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleEditClick = async (p) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${p.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      const productDetail = result.data;
      if (productDetail) {
        setFormData({
          name: productDetail.name,
          slug: productDetail.slug,
          price: productDetail.price,
          stock: productDetail.stock,
          description: productDetail.description || "",
          status: productDetail.status || "Active",
        });
        setEditId(productDetail.id);
        setExistingImages(productDetail.images || []);
        setIsEdit(true);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Gagal ambil detail produk:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("slug", formData.slug);
    dataToSend.append("price", formData.price);
    dataToSend.append("stock", formData.stock);
    dataToSend.append("description", formData.description);
    dataToSend.append("status", formData.status);

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        dataToSend.append("images[]", file);
      });
    }

    const url = isEdit ? `${API_URL}/${editId}` : API_URL;
    if (isEdit) dataToSend.append("_method", "PUT");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: dataToSend
      });
      if (res.ok) {
        alert(isEdit ? "Produk Berhasil Diperbarui!" : "Produk Berhasil Ditambah!");
        closeModal();
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

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: "", slug: "", price: "", stock: "", description: "", status: "Active" });
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setExistingImages([]);
  };

  // Filter Logika
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Manajemen Produk</h1>
            <p className="text-gray-500 mt-1 italic">Update stok dan status produk toko Anda.</p>
          </div>
          <button 
            onClick={() => { closeModal(); setShowModal(true); }}
            className="bg-gray-900 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Produk Baru
          </button>
        </div>

        {/* 1. STATISTIK */}
        {!fetchLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Total Produk</p>
              <h2 className="text-3xl font-black text-gray-900 mt-1">{products.length}</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Stok Menipis</p>
              <h2 className="text-3xl font-black text-orange-600 mt-1">{products.filter(p => p.stock > 0 && p.stock < 5).length}</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Stok Habis</p>
              <h2 className="text-3xl font-black text-red-600 mt-1">{products.filter(p => p.stock <= 0).length}</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Draft / Hidden</p>
              <h2 className="text-3xl font-black text-gray-400 mt-1">{products.filter(p => p.status === "Draft").length}</h2>
            </div>
          </div>
        )}

        {/* 2. CATEGORY & SEARCH */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <input 
              type="text" placeholder="Cari nama produk..." 
              className="w-full pl-5 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-6 py-3 rounded-2xl border border-gray-200 bg-white font-bold cursor-pointer"
            value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Mainan">Mainan</option>
            <option value="Hobi">Hobi</option>
          </select>
        </div>

        {/* 3. BULK DELETE & SELECT ALL */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => selectedProductIds.length === filteredProducts.length ? setSelectedProductIds([]) : setSelectedProductIds(filteredProducts.map(p => p.id))}
            className="text-xs font-bold text-gray-500 hover:text-blue-600"
          >
            {selectedProductIds.length === filteredProducts.length ? "✕ Batal Pilih" : "✓ Pilih Semua"}
          </button>
          
          {selectedProductIds.length > 0 && (
            <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs">
              Hapus ({selectedProductIds.length})
            </button>
          )}
        </div>

        {/* GRID PRODUK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group">
              {/* Checkbox */}
              <input 
                type="checkbox" className="absolute top-4 left-4 z-30 w-5 h-5 accent-blue-600"
                checked={selectedProductIds.includes(p.id)}
                onChange={(e) => e.target.checked ? setSelectedProductIds([...selectedProductIds, p.id]) : setSelectedProductIds(selectedProductIds.filter(id => id !== p.id))}
              />

              {/* 4. STATUS LABEL (Klik untuk ganti status) */}
              <button 
                onClick={() => toggleStatus(p)}
                className={`absolute top-4 right-4 z-30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm transition-all ${
                  p.status === "Active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                {p.status || "Active"}
              </button>

              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : "https://via.placeholder.com/400x300"} className="w-full h-full object-cover" />
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-800 uppercase truncate">{p.name}</h3>
                <p className="text-blue-600 font-black text-lg">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                <div className="flex justify-between mt-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Stok: {p.stock}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t flex gap-2">
                <button onClick={() => handleEditClick(p)} className="flex-1 bg-white border py-2 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors">✎ Edit</button>
                <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all">🗑 Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black mb-6 uppercase">{isEdit ? "Update Produk" : "Produk Baru"}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <input type="text" placeholder="Nama Produk" className="w-full border-2 p-3 rounded-xl" value={formData.name} onChange={handleNameChange} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Harga" className="w-full border-2 p-3 rounded-xl" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                <input type="number" placeholder="Stok" className="w-full border-2 p-3 rounded-xl" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
              </div>
              
              {/* Dropdown Status di Modal */}
              <select 
                className="w-full border-2 p-3 rounded-xl font-bold"
                value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">Active (Muncul di Toko)</option>
                <option value="Draft">Draft (Sembunyikan)</option>
              </select>

              <textarea placeholder="Deskripsi" className="w-full border-2 p-3 rounded-xl" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-6 font-bold text-gray-400">Batal</button>
                <button type="submit" disabled={loading} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold">
                  {loading ? "..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
