import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

const token = localStorage.getItem("surang_token");
if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("surang_token");
      delete api.defaults.headers.common["Authorization"];
    }
    return Promise.reject(err);
  }
);

export default api;
