import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, BookOpen, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAdmin, isCoordinator, isStudent } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent multiple submissions

    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        const userRole = result.user?.role;
        // Redirect based on role returned from login
        if (userRole === "admin") {
          navigate("/admin/dashboard");
        } else if (userRole === "coordinator") {
          navigate("/coordinator/dashboard");
        } else if (userRole === "student") {
          navigate("/student/dashboard");
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";

      // Handle rate limit error specifically
      if (error.response?.status === 429) {
        setError(
          "Too many login attempts. Please wait 15 minutes and try again."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full">
        
        {/* Glass morphism card */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Quiz Management
            </h2>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your.email@charusat.edu.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30 active:scale-95">
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign in</span>
                </>
              )}
            </button>

            <div className="text-center text-sm pt-2">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Register here
              </Link>
            </div>
          </form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Demo Credentials
            </p>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex items-center justify-between bg-white/60 px-3 py-2 rounded-lg">
                <span className="font-medium">Admin:</span>
                <code className="text-blue-700 font-mono">admin@charusat.edu.in</code>
              </div>
              <div className="flex items-center justify-between bg-white/60 px-3 py-2 rounded-lg">
                <span className="font-medium">Password:</span>
                <code className="text-blue-700 font-mono">Admin@123</code>
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-3 flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Coordinator and Student accounts must be created by Admin first</span>
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/90 mt-6">
          © 2026 CHARUSAT University. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
