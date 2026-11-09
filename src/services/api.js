import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const isPublicAuthRequest =
    url.includes("/auth/login") ||
    url.includes("/usuarios");

  if (isPublicAuthRequest) {
    if (config.headers?.delete) {
      config.headers.delete("Authorization");
    } else if (config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
  } else {
    const token = localStorage.getItem("maos_amigas_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.delete) {
      config.headers.delete("Authorization");
    } else if (config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
  }

  return config;
});

export default api;
