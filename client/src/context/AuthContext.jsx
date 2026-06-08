import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("surang_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.get("/auth/me")
        .then(res => setUser(res.data))
        .catch(() => { localStorage.removeItem("surang_token"); delete api.defaults.headers.common["Authorization"]; })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem("surang_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    const { token, user: userData } = res.data;
    localStorage.setItem("surang_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("surang_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
export default AuthContext;
