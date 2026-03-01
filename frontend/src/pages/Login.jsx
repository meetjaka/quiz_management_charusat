import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {};
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
      isValid = false;
    }
    if (!formData.password) {
      errors.password = "Password is required.";
      isValid = false;
    }
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (result.isFirstLogin) {
          navigate("/first-time-login", {
            state: {
              email: result.email,
              user: result.user,
            },
          });
          return;
        }

        const userRole = result.user?.role;
        if (userRole === "admin") navigate("/admin/dashboard");
        else if (userRole === "coordinator") navigate("/coordinator/dashboard");
        else if (userRole === "student") navigate("/student/dashboard");
        else navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";

      if (error.response?.status === 429) {
        setError("Too many login attempts. Please wait 15 minutes and try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-secondary bg-background font-sans">
      {/* Left side: Branding / Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-primary/10/50 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Charusat QMS</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to the future of assessments.
          </h1>
          <p className="text-gray-500 leading-relaxed">
            A state-of-the-art platform designed to streamline quiz creation, delivery, and automated performance tracking.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-gray-400">
          <Building2 className="w-4 h-4" />
          <span>© {new Date().getFullYear()} CHARUSAT University</span>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile Header (only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Charusat QMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Sign in</h2>
            <p className="text-sm text-gray-500">
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 rounded-md bg-danger/10 p-3 flex items-start gap-2 border border-danger/20"
            >
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger font-medium leading-snug">{error}</p>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-secondary">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-4 w-4 ${fieldErrors.email ? 'text-danger' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${fieldErrors.email
                      ? "border-danger text-danger placeholder-danger/60 focus:ring-danger/20 focus:border-danger"
                      : "border-border text-secondary placeholder-gray-400 hover:border-gray-300 focus:border-primary focus:ring-primary/20"
                    }`}
                  placeholder="name@charusat.edu.in"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-danger mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-secondary">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-4 w-4 ${fieldErrors.password ? 'text-danger' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${fieldErrors.password
                      ? "border-danger text-danger placeholder-danger/60 focus:ring-danger/20 focus:border-danger"
                      : "border-border text-secondary placeholder-gray-400 hover:border-gray-300 focus:border-primary focus:ring-primary/20"
                    }`}
                  placeholder="Enter your password"
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-danger mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="mt-8 pt-6 border-t border-border flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-2">New to the platform?</p>
              <Link
                to="/register"
                className="text-sm font-medium text-primary hover:underline"
              >
                Create a student account
              </Link>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-secondary/60 bg-gray-50 p-3 rounded-md border border-border">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Note: Coordinator and Admin accounts must be created by an Administrator.
              </span>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
