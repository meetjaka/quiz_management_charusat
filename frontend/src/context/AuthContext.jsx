import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await api.get("/auth/me");
          setUser(response.data.data);
        } catch (err) {
          console.error("Failed to load user:", err);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/auth/login", { email, password });
      const { token, user, isFirstLogin } = response.data;

      // Check if it's first-time login
      if (isFirstLogin) {
        // For admin users, skip first-time login flow
        if (user?.role === "admin") {
          localStorage.setItem("token", token);
          setUser(user);
          return { success: true, user };
        }

        // For non-admin users, store token and handle first-time login
        // Store token so they can make authenticated requests during profile setup
        localStorage.setItem("token", token);
        setUser(user);
        return {
          success: true,
          isFirstLogin: true,
          user,
          email,
          message: response.data.message,
        };
      }

      localStorage.setItem("token", token);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post("/auth/register", userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await api.put("/auth/update-password", { currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Password change failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCoordinator: user?.role === "coordinator",
    isStudent: user?.role === "student",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
