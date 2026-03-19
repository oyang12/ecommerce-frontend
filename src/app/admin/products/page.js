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

  // Ref untuk custom upload button
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
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Produk</h1>
            <p className="text-gray-500 mt-1">Kelola inventaris dan tampilan produk toko Anda.</p>
          </div>
          <button 
            onClick={() => { closeModal(); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 flex items-center gap-2 active:scale-95"
          >
            <span className="text-xl">+</span> Tambah Produk Baru
          </button>
        </div>

        {/* LOADING & CARD GRID */}
        {fetchLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                  {/* Bagian Gambar */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img 
                      src={
                        p.thumbnail 
                          ? `https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/${p.thumbnail}`
                          : p.image 
                            ? `https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/${p.image}`
                            : "https://via.placeholder.com/400x300?text=No+Image"
                      } 
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      // Jika link di atas mati/salah, tampilkan placeholder agar tidak kosong
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                        Stok: {p.stock}
                      </span>
                    </div>
                  </div>

                  {/* Konten Text */}
                  <div className="p-5 flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                    <p className="text-blue-600 font-black text-xl mt-2">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2 italic">{p.description || "Tidak ada deskripsi produk."}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleEditClick(p)}
                      disabled={loading}
                      className="w-full bg-white border border-blue-600 text-blue-600 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading && editId === p.id ? "..." : "✎ Edit"}
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(p.id)}
                      className="w-full bg-red-500 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-gray-400">Belum ada produk.</div>
            )}
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEdit ? "Edit Data Produk" : "Input Data Produk"}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Produk</label>
                <input type="text" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.name} onChange={handleNameChange} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-500 text-xs italic">Slug (Otomatis)</label>
                <input type="text" readOnly className="w-full border p-2 rounded-lg bg-gray-100 text-gray-500" value={formData.slug} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Harga (Rp)</label>
                  <input type="number" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stok</label>
                  <input type="number" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                <textarea className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" rows="3"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              {/* FOTO DATABASE (EDIT) */}
              {isEdit && existingImages.length > 0 && (
                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Foto Saat Ini</label>
                  <div className="grid grid-cols-4 gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-lg shadow-sm overflow-hidden border border-white">
                        <img src={img.url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PREVIEW FOTO BARU */}
              {previewUrls.length > 0 && (
                <div className="border border-dashed border-blue-200 rounded-lg p-4 bg-blue-50">
                  <label className="block text-sm font-semibold mb-2 text-blue-700">Pratinjau Foto Baru</label>
                  <div className="grid grid-cols-4 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg shadow-sm overflow-hidden border border-white">
                        <img src={url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemovePreview(index)} className="absolute top-1 right-1 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CUSTOM UPLOAD BUTTON */}
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 text-blue-600">{isEdit ? "Tambah Foto Baru" : "Upload Foto Produk"}</label>
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full border-2 border-dashed border-blue-300 p-6 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-1 group shadow-sm"
                >
                  <span className="text-2xl font-bold group-hover:scale-125 transition-transform">+</span>
                  <span className="font-semibold text-sm">Pilih File Foto</span>
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-8 border-t pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Batal</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 shadow-lg flex items-center gap-2">
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {loading ? "Proses..." : isEdit ? "Update Produk" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
