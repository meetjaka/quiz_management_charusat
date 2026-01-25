import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Award,
  Settings
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case "admin":
        return [
          { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { path: "/admin/users", label: "Users", icon: Users },
          { path: "/admin/quizzes", label: "Quizzes", icon: FileText },
          { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        ];
      case "coordinator":
        return [
          { path: "/coordinator/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { path: "/coordinator/quizzes", label: "My Quizzes", icon: FileText },
          { path: "/coordinator/analytics", label: "Analytics", icon: BarChart3 },
          { path: "/coordinator/settings", label: "Settings", icon: Settings },
        ];
      case "student":
        return [
          { path: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { path: "/student/quizzes", label: "Available Quizzes", icon: FileText },
          { path: "/student/analytics", label: "My Performance", icon: BarChart3 },
          { path: "/student/results", label: "My Results", icon: Award },
          { path: "/student/settings", label: "Settings", icon: Settings },
        ];
      default:
        return [];
    }
  };
  
  const navLinks = getNavLinks();

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case "admin": return "bg-purple-100 text-purple-700 border-purple-200";
      case "coordinator": return "bg-blue-100 text-blue-700 border-blue-200";
      case "student": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-white/95">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Link to={`/${user?.role}/dashboard`} className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-2 shadow-lg shadow-blue-200 group-hover:shadow-xl group-hover:shadow-blue-300 transition-all">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Quiz System
                  </span>
                  <p className="text-xs text-gray-500 -mt-0.5">CHARUSAT</p>
                </div>
              </Link>
            </div>

            {/* Right: User Info & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                  {user?.role}
                </span>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white h-full fixed left-0 top-16">
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                      <span className="truncate">{link.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-900 truncate">Need Help?</p>
                    <p className="text-xs text-blue-700 truncate">Contact Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 lg:hidden"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-2">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">Quiz System</span>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="flex-1 px-3 py-6 space-y-1">
                    {navLinks.map((link) => {
                      const isActive = location.pathname === link.path;
                      const Icon = link.icon;
                      
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                            isActive
                              ? "bg-blue-50 text-blue-700 shadow-sm"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                            <span>{link.label}</span>
                          </div>
                          {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 w-full overflow-x-hidden p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
