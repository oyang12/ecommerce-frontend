"use client";
import { useEffect, useState, useRef } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // State untuk file asli dan preview
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
        fetchProducts();
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus.");
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

  const handleDeleteExistingImage = async (imageId) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`${IMAGE_API_URL}/${imageId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
      }
    } catch (err) {
      console.error("Error hapus foto:", err);
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

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        dataToSend.append("images[]", file);
      });
    }

    const url = isEdit ? `${API_URL}/${editId}` : API_URL;
    // Trik Laravel: Gunakan POST dengan _method PUT untuk update multipart/form-data
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
    setFormData({ name: "", slug: "", price: "", stock: "", description: "" });
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setExistingImages([]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Manajemen Produk</h1>
            <p className="text-gray-500 mt-1 italic">Update stok dan produk toko dengan mudah.</p>
          </div>
          <button 
            onClick={() => { closeModal(); setShowModal(true); }}
            className="bg-gray-900 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Produk Baru
          </button>
        </div>

        {/* --- FITUR #1: DASHBOARD STATISTIK --- */}
        {!fetchLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Total Produk */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-500 transition-all">
              <div>
                <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Total Produk</p>
                <h2 className="text-3xl font-black text-gray-900 mt-1">{products.length}</h2>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all text-2xl">📦</div>
            </div>
        
            {/* Stok Menipis */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-orange-500 transition-all">
              <div>
                <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Stok Menipis (&lt;5)</p>
                <h2 className="text-3xl font-black text-orange-600 mt-1">
                  {products.filter(p => p.stock > 0 && p.stock < 5).length}
                </h2>
              </div>
              <div className="bg-orange-50 text-orange-600 p-3 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all text-2xl">⚠️</div>
            </div>
        
            {/* Stok Habis */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-red-500 transition-all">
              <div>
                <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Stok Habis</p>
                <h2 className="text-3xl font-black text-red-600 mt-1">
                  {products.filter(p => p.stock <= 0).length}
                </h2>
              </div>
              <div className="bg-red-50 text-red-600 p-3 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all text-2xl">🚫</div>
            </div>
          </div>
        )}


        {/* LOADING & CARD GRID */}
        {fetchLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-96 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                  {/* Gambar */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img 
                      src={
                        p.thumbnail 
                          ? `${STORAGE_URL}${p.thumbnail}`
                          : p.image 
                            ? `${STORAGE_URL}${p.image}`
                            : "https://via.placeholder.com/400x300?text=No+Image"
                      } 
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "https://via.placeholder.com/400x300?text=Error+Loading";
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm border border-gray-100">
                        Stok: {p.stock}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.name}</h3>
                    <p className="text-blue-600 font-black text-xl mt-1">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2 italic font-medium leading-relaxed">
                      {p.description || "Sentuhan estetika untuk koleksi harian Anda."}
                    </p>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleEditClick(p)}
                      disabled={loading}
                      className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading && editId === p.id ? "..." : "✎ Edit"}
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(p.id)}
                      className="w-full bg-red-50 text-red-600 py-2.5 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      🗑 Hapus
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">Belum ada produk yang terdaftar.</p>
              </div>
            )}
          </div>
        )}
      </div>

      


      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-100">
            <h2 className="text-2xl font-black mb-6 text-gray-900 uppercase tracking-tight">
              {isEdit ? "Update Data" : "Produk Baru"}
            </h2>
            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nama Produk</label>
                <input type="text" required className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-blue-400 transition-all font-medium"
                  value={formData.name} onChange={handleNameChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Harga (Rp)</label>
                  <input type="number" required className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-blue-400 transition-all font-medium"
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Stok</label>
                  <input type="number" required className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-blue-400 transition-all font-medium"
                    value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Deskripsi</label>
                <textarea className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-blue-400 transition-all font-medium" rows="3"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              {/* FOTO DATABASE (JIKA EDIT) */}
              {isEdit && existingImages.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-3 text-center">Foto Saat Ini</label>
                  <div className="grid grid-cols-4 gap-3">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-white">
                        <img src={img.url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:scale-110 transition-transform">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UPLOAD FOTO BARU */}
              <div className="mt-4">
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-200 p-6 rounded-2xl bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-200 transition-all flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-xl">+</span>
                  <span className="font-bold text-xs uppercase tracking-widest">{isEdit ? "Tambah Foto" : "Upload Foto"}</span>
                </button>
              </div>

              {/* PREVIEW BARU */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-3 pt-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-100">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemovePreview(index)} className="absolute top-1 right-1 bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* FOOTER MODAL */}
              <div className="flex justify-end gap-3 mt-8 border-t pt-6">
                <button type="button" onClick={closeModal} className="px-6 py-2 text-gray-400 hover:text-gray-800 font-bold text-sm uppercase tracking-widest">Batal</button>
                <button type="submit" disabled={loading} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 disabled:bg-gray-300 shadow-xl transition-all flex items-center gap-2">
                  {loading ? "Processing..." : isEdit ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
