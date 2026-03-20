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

  const handleDeleteExistingImage = async (imageId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${IMAGE_API_URL}/${imageId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
      }
    } catch (err) {
      alert("Gagal menghapus gambar");
    }
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
    if (!p) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${p.slug}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      const data = result.data;
      if (data) {
        setFormData({
          name: data.name,
          slug: data.slug,
          price: data.price,
          stock: data.stock,
          description: data.description || "",
          status: data.status || "Active",
        });
        setEditId(data.id);
        const formattedImages = (data.images || []).map(img => {
          const fileName = img.image || ""; 
          return {
            ...img,
            url: `${STORAGE_URL}${fileName}` 
          };
        });
        setExistingImages(formattedImages);
        setIsEdit(true);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Gagal ambil detail:", err);
    } finally {
      setLoading(false);
    }
  };

  // BAGIAN YANG DIPERBARUI SESUAI LOGIKA YANG BERHASIL
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("slug", formData.slug);
    dataToSend.append("price", formData.price);
    dataToSend.append("stock", formData.stock);
    dataToSend.append("description", formData.description || "");
    dataToSend.append("status", formData.status);

    // Menggunakan loop for seperti kode handleAddProduct yang kamu berikan
    if (selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        dataToSend.append("images[]", selectedFiles[i]); 
      }
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

        {/* STATISTIK */}
        {!fetchLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Total Produk</p>
              <h2 className="text-3xl font-black text-gray-900 mt-1">{products.length}</h2>
            </div>
            {/* 2. Stok Menipis (Logika Baru: <= 20) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Stok Menipis</p>
              <h2 className="text-3xl font-black text-yellow-500 mt-1"> {/* UBAH KE YELLOW */}
                {products.filter(p => p.stock > 0 && p.stock <= 20).length}
              </h2>
            </div>
            
            {/* 3. Stok Habis (Logika: === 0) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Stok Habis</p>
              <h2 className="text-3xl font-black text-red-600 mt-1">
                {products.filter(p => p.stock == 0).length}
              </h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Draft / Hidden</p>
              <h2 className="text-3xl font-black text-gray-400 mt-1">{products.filter(p => p.status === "Draft").length}</h2>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Produk Diskon</p>
              <h2 className="text-3xl font-black text-purple-600 mt-1">
                {products.filter(p => p.discount_price > 0).length}
              </h2>
            </div>
          </div>
        )}

        {/* SEARCH & FILTER */}
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

        {/* BULK ACTIONS */}
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

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group hover:shadow-xl transition-all duration-300">
              <input 
                type="checkbox" className="absolute top-4 left-4 z-30 w-5 h-5 accent-blue-600 cursor-pointer"
                checked={selectedProductIds.includes(p.id)}
                onChange={(e) => e.target.checked ? setSelectedProductIds([...selectedProductIds, p.id]) : setSelectedProductIds(selectedProductIds.filter(id => id !== p.id))}
              />

              <button 
                onClick={() => toggleStatus(p)}
                className={`absolute top-4 right-4 z-30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm transition-all hover:scale-105 active:scale-95 ${
                  p.status === "Active" ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                {p.status || "Active"}
              </button>

              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                  src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : "https://via.placeholder.com/400x300"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={p.name}
                />
              </div>

              <div className="p-5 pb-0">
                <h3 className="font-bold text-gray-800 uppercase truncate">{p.name}</h3>
                <p className="text-gray-400 text-[11px] mt-1 line-clamp-2 leading-relaxed h-[32px]">
                  {p.description || "Tidak ada deskripsi produk."}
                </p>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-blue-600 font-black text-lg">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                  <span className={`text-[10px] font-bold uppercase ${
                    p.stock === 0 ? 'text-red-600' : p.stock <= 20 ? 'text-yellow-500' : 'text-gray-400'
                  }`}>
                    Stok: {p.stock}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t flex gap-2 mt-4">
                <button onClick={() => handleEditClick(p)} className="flex-1 bg-white border border-gray-200 py-2 rounded-xl font-bold text-xs hover:bg-gray-900 hover:text-white transition-all">✎ Edit</button>
                <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-red-50 text-red-600 border border-red-100 py-2 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all">🗑 Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PRODUK (TAMBAH / EDIT) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[95vh] border border-gray-100">
            
            {/* Header Modal */}
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              {isEdit ? "Update Produk" : "Produk Baru"}
            </h2>
      
            <form onSubmit={handleSaveProduct} className="space-y-6">
              
              {/* Nama Produk */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nama Produk</label>
                <input 
                  type="text" 
                  placeholder="Masukkan nama produk..."
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition-all font-bold text-gray-700 placeholder:font-normal" 
                  value={formData.name} 
                  onChange={handleNameChange} 
                  required 
                />
              </div>
      
              {/* Harga & Stok (Grid 2 Kolom) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Harga (Rp)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition-all font-bold text-gray-700" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Stok</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition-all font-bold text-gray-700" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                    required 
                  />
                </div>
              </div>
      
              {/* Diskon & Status (Grid 2 Kolom) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-1">Diskon (%)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0"
                    className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition-all font-black text-blue-600 bg-blue-50/30" 
                    value={formData.disc} 
                    onChange={(e) => setFormData({...formData, disc: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status Tampil</label>
                  <select 
                    className="w-full border-2 border-gray-100 p-4 rounded-2xl font-bold bg-white outline-none focus:border-blue-400 transition-all appearance-none cursor-pointer" 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
      
              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Deskripsi Produk</label>
                <textarea 
                  placeholder="Tulis detail produk di sini..."
                  className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-400 transition-all font-medium text-gray-600 min-h-[100px] resize-none" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              
              {/* Upload Foto & Gallery */}
              <div className="border-t border-dashed pt-6">
                {isEdit && existingImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-50 group">
                        <img src={img.url} className="w-full h-full object-cover" alt="existing" />
                        <button 
                          type="button" 
                          onClick={() => handleDeleteExistingImage(img.id)} 
                          className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black text-[10px] uppercase"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
      
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()} 
                  className="w-full border-2 border-dashed border-gray-200 p-6 rounded-[25px] bg-gray-50/50 text-gray-400 font-black text-[11px] uppercase tracking-widest hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 transition-all flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">+</span>
                  Pilih Foto Produk
                </button>
      
                {/* Preview Foto Baru */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-100 group">
                      <img src={url} className="w-full h-full object-cover" alt="preview" />
                      <button 
                        type="button" 
                        onClick={() => handleRemovePreview(index)} 
                        className="absolute top-1 right-1 bg-black text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
      
              {/* Footer Tombol Action */}
              <div className="flex items-center justify-end gap-6 pt-8 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-gray-900 text-white px-10 py-4 rounded-[20px] font-black uppercase text-[11px] tracking-[0.15em] hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {loading ? "Sabar Ya..." : "Simpan Produk"}
                </button>
              </div>
      
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
