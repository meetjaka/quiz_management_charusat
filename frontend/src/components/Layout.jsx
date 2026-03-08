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
  Bell,
  Search,
  ChevronLeft,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            group: "Overview", links: [
              { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
              { path: "/admin/analytics", label: "Analytics", icon: BarChart3 }
            ]
          },
          {
            group: "Management", links: [
              { path: "/admin/users", label: "Users", icon: Users },
              { path: "/admin/groups", label: "Groups", icon: GraduationCap },
              { path: "/admin/quizzes", label: "Quizzes", icon: FileText }
            ]
          }
        ];
      case "coordinator":
        return [
          {
            group: "Overview", links: [
              { path: "/coordinator/dashboard", label: "Dashboard", icon: LayoutDashboard },
              { path: "/coordinator/analytics", label: "Analytics", icon: BarChart3 },
            ]
          },
          {
            group: "Quiz Management", links: [
              { path: "/coordinator/quizzes", label: "My Quizzes", icon: FileText }
            ]
          },
          {
            group: "Preferences", links: [
              { path: "/coordinator/settings", label: "Settings", icon: Settings },
            ]
          }
        ];
      case "student":
        return [
          {
            group: "Study", links: [
              { path: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
              { path: "/student/quizzes", label: "Available Quizzes", icon: FileText },
            ]
          },
          {
            group: "Performance", links: [
              { path: "/student/analytics", label: "My Analytics", icon: BarChart3 },
              { path: "/student/results", label: "My Results", icon: Award },
            ]
          },
          {
            group: "Preferences", links: [
              { path: "/student/settings", label: "Settings", icon: Settings },
            ]
          }
        ];
      default:
        return [];
    }
  };

  const navGroups = getNavLinks();

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case "admin":
        return "bg-accent-100 text-accent-700 border-accent-200";
      case "coordinator":
        return "bg-brand-100 text-brand-700 border-brand-200";
      case "student":
        return "bg-success-50 text-success-700 border-success-200";
      default:
        return "bg-secondary-100 text-secondary-700 border-secondary-200";
    }
  };

  const currentPath = location.pathname.split('/').filter(Boolean).pop();
  const pageTitle = title || (currentPath ? currentPath.charAt(0).toUpperCase() + currentPath.slice(1).replace(/-/g, ' ') : 'Dashboard');

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-white border-r border-secondary-200 h-screen sticky top-0 z-30"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-200">
          {!sidebarCollapsed && (
            <Link to={`/${user?.role}/dashboard`} className="flex items-center gap-3 overflow-hidden">
              <div className="bg-primary-600 rounded-lg p-1.5 flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-primary-800 whitespace-nowrap tracking-tight">CHARUSAT</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <Link to={`/${user?.role}/dashboard`} className="mx-auto flex items-center justify-center">
              <div className="bg-primary-600 rounded-lg p-2">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </Link>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="px-3">
              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                  {group.group}
                </p>
              )}
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive = location.pathname.includes(link.path);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`group flex items-center px-3 py-2.5 rounded-lg transition-all relative ${isActive
                          ? "bg-brand-50 text-brand-700 font-medium"
                          : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                        }`}
                      title={sidebarCollapsed ? link.label : ""}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-600 rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-brand-600' : 'text-secondary-400 group-hover:text-secondary-700'}`} />
                      {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-secondary-200">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-secondary-500 hover:bg-secondary-100 rounded-lg transition-colors mb-2"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors group"
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <LogOut className={`w-5 h-5 ${!sidebarCollapsed && 'mr-3'} group-hover:text-danger-700`} />
            {!sidebarCollapsed && <span className="font-medium group-hover:text-danger-700">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200 lg:hidden flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-200">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-600 rounded-lg p-1.5 flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-primary-800">CHARUSAT</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 custom-scrollbar">
                {navGroups.map((group, idx) => (
                  <div key={idx} className="px-3">
                    <p className="px-3 mb-2 text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                      {group.group}
                    </p>
                    <div className="space-y-1">
                      {group.links.map((link) => {
                        const isActive = location.pathname.includes(link.path);
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex items-center px-3 py-2.5 rounded-lg transition-all relative ${isActive
                                ? "bg-brand-50 text-brand-700 font-medium"
                                : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                              }`}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-600 rounded-r-full" />
                            )}
                            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-brand-600' : 'text-secondary-400 group-hover:text-secondary-700'}`} />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-secondary-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors group"
                >
                  <LogOut className="w-5 h-5 mr-3 group-hover:text-danger-700" />
                  <span className="font-medium group-hover:text-danger-700">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 flex-shrink-0">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center text-sm">
              <span className="text-secondary-500 capitalize">{user?.role}</span>
              <ChevronRight className="w-4 h-4 mx-2 text-secondary-400" />
              <span className="font-semibold text-secondary-900">{pageTitle}</span>
            </div>

            <div className="sm:hidden font-semibold text-secondary-900 truncate">
              {pageTitle}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
            {/* Search Bar */}
            <div className="hidden md:flex relative max-w-sm w-full mx-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-secondary-400"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-secondary-500 hover:bg-secondary-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="flex items-center pl-2 sm:pl-4 border-l border-secondary-200">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-secondary-900 group-hover:text-brand-600 transition-colors">
                    {user?.name || "User"}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor()}`}>
                    {user?.role}
                  </span>
                </div>
                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-tr from-brand-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white ring-2 ring-transparent group-hover:ring-brand-100 transition-all">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-secondary-400 hidden sm:block" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent pointer-events-none -z-10" />
          <div className="h-full w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
