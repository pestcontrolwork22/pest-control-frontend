import { useState } from "react";
import {
  Calendar,
  FileText,
  Home,
  Users,
  ReceiptText,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: FileText, label: "Contracts", path: "/contracts" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: ReceiptText, label: "Invoices", path: "/invoices" },
    { icon: Users, label: "About Us", path: "/about" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* --- Sidebar (Desktop) --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-30">
        {/* Brand Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          {/* Replace with actual logo SVG if needed */}
          <div className="img-wrapper w-12 mr-5">
            <img src="/logo.png" alt="Logo" className="w-100" />
          </div>
          <span className="text-white font-bold tracking-tight text-lg">Tripower</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
              >
                <div className="flex items-center">
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.label}
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">

            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Pest Control</p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- Mobile Sidebar (Drawer) --- */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Drawer Content */}
        <aside
          className={`absolute left-0 top-0 h-full w-72 bg-slate-900 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <span className="text-white font-bold text-lg">Tripower</span>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </aside>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">

        {/* Header (Mobile Only / Sticky) */}
        <header className="sticky top-0 z-20 h-16 flex-none bg-white/80 backdrop-blur-md border-b border-slate-200 lg:hidden px-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-slate-800">Tripower Services</span>
          <div className="img-wrapper w-12">
            <img src="/logo.png" alt="Logo" className="w-100 " />
          </div> {/* Placeholder for alignment */}
        </header>

        {/* Page Content */}
        <main className="flex-1 relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-white to-transparent -z-10 pointer-events-none" />
          <Outlet />
        </main>
      </div>
    </div>
  );
};