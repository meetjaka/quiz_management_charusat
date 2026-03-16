// import React, { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Mail,
//   Lock,
//   LogIn,
//   BookOpen,
//   AlertCircle,
//   CheckCircle2,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import api from "../api";

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login } = useAuth(); // Removed unused props for cleaner code

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const from = location.state?.from?.pathname || "/";

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (loading) return;

//     setLoading(true);
//     setError("");

//     try {
//       const result = await login(formData.email, formData.password);

//       if (result.success) {
//         // Handle first-time login for non-admin users
//         if (result.isFirstLogin) {
//           navigate("/first-time-login", {
//             state: {
//               email: result.email,
//               user: result.user,
//             },
//           });
//           return;
//         }

//         const userRole = result.user?.role;
//         if (userRole === "admin") {
//           navigate("/admin/dashboard");
//         } else if (userRole === "coordinator") {
//           navigate("/coordinator/dashboard");
//         } else if (userRole === "student") {
//           navigate("/student/dashboard");
//         } else {
//           navigate(from, { replace: true });
//         }
//       } else {
//         setError(result.error);
//       }
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || "Login failed. Please try again.";

//       if (error.response?.status === 429) {
//         setError(
//           "Too many login attempts. Please wait 15 minutes and try again.",
//         );
//       } else {
//         setError(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//         className="w-full max-w-md space-y-8"
//       >
//         {/* Header Section */}
//         <div className="text-center">
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
//             className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4"
//           >
//             <BookOpen className="h-6 w-6 text-white" />
//           </motion.div>
//           <h2 className="text-3xl font-bold tracking-tight text-gray-900">
//             Welcome back
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Sign in to access the Quiz Management System
//           </p>
//         </div>

//         {/* Card */}
//         <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 border border-gray-100 rounded-2xl sm:px-10 relative">
//           {/* Error Message */}
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3"
//             >
//               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-red-700 font-medium">{error}</p>
//             </motion.div>
//           )}

//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {/* Email Field */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Email Address
//               </label>
//               <div className="relative group">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
//                 </div>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
//                   placeholder="Enter your email"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Password
//               </label>
//               <div className="relative group">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
//                 </div>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete="current-password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
//                   placeholder="Enter your password"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
//             >
//               {loading ? (
//                 <div className="flex items-center gap-2">
//                   <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   <span>Signing in...</span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <LogIn className="h-4 w-4" />
//                   <span>Sign in</span>
//                 </div>
//               )}
//             </button>
//           </form>
//         </div>

//         <p className="text-center text-xs text-gray-400">
//           © 2026 CHARUSAT University. All rights reserved.
//         </p>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;




import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
// import api from "../api"; // Assuming this is used elsewhere in your actual file

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

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      if (error.response?.status === 429) {
        setError(
          "Too many login attempts. Please wait 15 minutes and try again.",
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Branding Panel (Hidden on mobile, shows on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between p-12 overflow-hidden">
        {/* Subtle background pattern/gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900/50 z-0"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent z-0"></div>

        {/* Top Brand */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3 text-white"
        >
          <div className="bg-blue-600 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-widest uppercase">CHARUSAT</span>
        </motion.div>

        {/* Center Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Academic Excellence <br /> Through Assessment
          </h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed">
            Welcome to the official Quiz Management System. Secure, reliable, and designed to support the academic community.
          </p>
        </motion.div>

        {/* Bottom Copyright */}
        <div className="relative z-10 text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} CHARUSAT University. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32 bg-gray-50/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto lg:max-w-md"
        >
          {/* Mobile-only Header */}
          <div className="lg:hidden text-center mb-10">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">CHARUSAT</h2>
            <p className="text-sm text-gray-500 mt-1">Quiz Management System</p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign in</h2>
            <p className="mt-2 text-sm text-gray-500">
              Please enter your university credentials to continue.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 rounded-md bg-red-50 p-4 border border-red-200 flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                University Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 sm:text-sm transition-all"
                  placeholder="e.g. student@charusat.edu.in"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                {/* Optional Forgot Password link - makes it look much more professional */}
                {/* <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </a> */}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 sm:text-sm transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Secure Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mobile copyright */}
          <p className="mt-10 text-center text-xs text-gray-400 lg:hidden">
            © {new Date().getFullYear()} CHARUSAT University.<br />All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;