import axios from "axios";

const api = axios.create({
  baseURL: "https://ecommerce-backend-production-aa2e.up.railway.app",
});

export default api;
