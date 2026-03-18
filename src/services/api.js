// services/api.js
export const fetchProducts = async () => {
  try {
    const res = await fetch('https://ecommerce-backend-production-aa2e.up.railway.app/api/products');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
};
