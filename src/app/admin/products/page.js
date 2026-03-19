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
    status: "Active",
  });

  const API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/products";
  const IMAGE_API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/product-images";
  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  const fetchProducts = async () => {
    setFetchLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
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
        body: JSON.stringify({ _method: "PUT", status: newStatus })
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

  const handleEditClick = async (p) => {
    // 1. Cek apakah data produk p ada
    if (!p) return;
    
    console.log("Membuka edit untuk:", p); // Debugging: Cek di console browser (F12)
    setLoading(true);
    
    const token = localStorage.getItem("token");
    
    // Gunakan slug jika ada, kalau tidak ada pakai ID
    const identifier = p.slug || p.id; 

    try {
      const res = await fetch(`${API_URL}/${identifier}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Gagal mengambil data dari server");

      const result = await res.json();
      const data = result.data;

      if (data) {
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          price: data.price || "",
          stock: data.stock || 0,
          description: data.description || "",
          status: data.status || "Active",
        });
        setEditId(data.id);

        // Perbaikan Path Gambar agar tidak crash jika image_path kosong
        const formattedImages = (data.images || []).map(img => {
          // Cek apakah image_path ada, jika tidak ada gunakan string kosong
          const path = img.image_path || ""; 
          const cleanPath = path.replace(/^products\//, "");
          
          return {
            ...img,
            // Gunakan thumbnail_url dari API jika ada sebagai fallback
            url: path ? `${STORAGE_URL}${cleanPath}` : (img.url || "https://via.placeholder.com/150")
          };
        });
        
        setExistingImages(formattedImages);
        setIsEdit(true);
        setShowModal(true); // Pastikan ini terpanggil di akhir
      }
    } catch (err) {
      console.error("Gagal ambil detail produk:", err);
      alert("Gagal memuat detail produk. Pastikan API mengembalikan data yang benar.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleDeleteExistingImage = async (imageId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${IMAGE_API_URL}/${imageId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (err) {
      console.error("Gagal hapus gambar:", err);
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

  const handleBulkDelete = async () => {
    if (!confirm(`Yakin ingin menghapus ${selectedProductIds.length} produk terpilih?`)) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      await Promise.all(selectedProductIds.map(id => 
        fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        })
      ));
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
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

        {/* SEARCH & STATS */}
        {!fetchLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Total Produk</p>
              <h2 className="text-3xl font-black text-gray-900 mt-1">{products.length}</h2>
            </div>
            {/* ... statistik lainnya tetap sama ... */}
          </div>
        )}

        {/* GRID PRODUK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group hover:shadow-xl transition-all duration-300">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                  src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail.replace(/^products\//, "")}` : "https://via.placeholder.com/400x300"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                  alt={p.name}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 uppercase truncate">{p.name}</h3>
                <p className="text-blue-600 font-black mt-2">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleEditClick(p)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold text-xs">Edit</button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold text-xs">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-gray-900">{isEdit ? "Update Produk" : "Produk Baru"}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <input type="text" placeholder="Nama Produk" className="w-full border-2 p-3 rounded-xl outline-none" value={formData.name} onChange={handleNameChange} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Harga" className="w-full border-2 p-3 rounded-xl outline-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                <input type="number" placeholder="Stok" className="w-full border-2 p-3 rounded-xl outline-none" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
              </div>
              
              {/* EXISTING IMAGES */}
              {isEdit && existingImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 border-t pt-4">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={img.url} className="w-full h-full object-cover" alt="existing" onError={(e) => e.target.src="https://via.placeholder.com/150"} />
                      <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 text-[10px]">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* NEW IMAGES */}
              <div className="pt-4">
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current.click()} className="w-full border-2 border-dashed p-4 rounded-xl font-bold text-xs uppercase bg-gray-50">
                  + Tambah Foto
                </button>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={url} className="w-full h-full object-cover" alt="preview" />
                      <button type="button" onClick={() => handleRemovePreview(index)} className="absolute top-0 right-0 bg-black text-white w-5 h-5 text-[10px]">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={closeModal} className="px-6 font-bold text-gray-400 text-xs">BATAL</button>
                <button type="submit" disabled={loading} className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs">
                  {loading ? "MEMPROSES..." : "SIMPAN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
