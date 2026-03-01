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
  Settings,
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
          {
            path: "/admin/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { path: "/admin/users", label: "Users", icon: Users },
          { path: "/admin/groups", label: "Groups", icon: GraduationCap },
          { path: "/admin/quizzes", label: "Quizzes", icon: FileText },
          { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        ];
      case "coordinator":
        return [
          {
            path: "/coordinator/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { path: "/coordinator/quizzes", label: "My Quizzes", icon: FileText },
          {
            path: "/coordinator/analytics",
            label: "Analytics",
            icon: BarChart3,
          },
          { path: "/coordinator/settings", label: "Settings", icon: Settings },
        ];
      case "student":
        return [
          {
            path: "/student/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            path: "/student/quizzes",
            label: "Available Quizzes",
            icon: FileText,
          },
          {
            path: "/student/analytics",
            label: "My Performance",
            icon: BarChart3,
          },
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
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "coordinator":
        return "bg-primary/10 text-primary border-primary/20";
      case "student":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-gray-100 text-gray-700 border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-secondary">
      {/* Modern Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-lg bg-card/95">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100/80 hover:text-secondary transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <Link
                to={`/${user?.role}/dashboard`}
                className="flex items-center gap-3 group"
              >
                <div className="bg-primary rounded-md p-2 subtle-shadow group-hover:bg-[#1d4ed8] transition-colors">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-secondary tracking-tight">
                    Charusat QMS
                  </span>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider -mt-1">
                    Learning Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-secondary">
                  {user?.name}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border mt-0.5 ${getRoleBadgeColor()}`}
                >
                  {user?.role}
                </span>
              </div>

              <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-white font-semibold text-sm subtle-shadow">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="h-6 w-px bg-border mx-1"></div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-danger hover:bg-danger/5 rounded-md transition-colors"
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
          <div className="flex flex-col w-64 border-r border-border bg-card h-[calc(100vh-4rem)] fixed left-0 top-16 shadow-none">
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                        ? "bg-primary/5 text-primary"
                        : "text-gray-500 hover:bg-gray-50/80 hover:text-secondary"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary fill-primary/10" : "text-gray-400 group-hover:text-secondary transition-colors"}`}
                      />
                      <span className="truncate">{link.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border flex-shrink-0">
              <div className="bg-primary/5 rounded-md p-3 border border-primary/10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-secondary">
                      Need Help?
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 hover:text-primary cursor-pointer transition-colors">
                      Contact Support
                    </p>
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
                className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border lg:hidden"
              >
                <div className="flex flex-col h-full pt-16">
                  <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navLinks.map((link) => {
                      const isActive = location.pathname === link.path;
                      const Icon = link.icon;

                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                              ? "bg-primary/5 text-primary"
                              : "text-gray-500 hover:bg-gray-50/80 hover:text-secondary"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary fill-primary/10" : "text-gray-400 group-hover:text-secondary transition-colors"}`}
                            />
                            <span>{link.label}</span>
                          </div>
                          {isActive && (
                            <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          )}
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
        <main className="flex-1 min-w-0 p-6 lg:p-8 -mt-16 sm:mt-0 transition-all">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
