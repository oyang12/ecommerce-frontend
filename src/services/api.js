import axios from 'axios';

const BASE_URL = 'https://ecommerce-backend-production-aa2e.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; // default export

// ✅ pastikan export ini ada
export const fetchProducts = async () => {
  try {
    const res = await api.get('/products');
    return res.data.data || [];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
};

// ✅ tambahkan export ini
export const fetchProductDetail = async (slug) => {
  try {
    const res = await api.get(`/products/${slug}`);
    return res.data.data || res.data;
  } catch (err) {
    console.error('Error fetching product detail:', err);
    return null;
  }
};
