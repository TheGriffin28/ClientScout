import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // IMPORTANT (cookies)
});

// Add request interceptor to include token in Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on auth pages or if it's an auth endpoint
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");
      const isAuthPage = window.location.pathname === "/signin" || window.location.pathname === "/signup";
      
      // Only redirect if it's not an auth endpoint and not already on auth page
      if (!isAuthEndpoint && !isAuthPage) {
        // Clear token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
