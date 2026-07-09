"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { LogOut, LayoutDashboard, Truck, Users, Receipt, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function Sidebar() {
  const { signOut, user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Units", href: "/units", icon: Truck },
    { name: "Suppliers", href: "/suppliers", icon: Users },
    { name: "Transactions", href: "/transactions", icon: Receipt },
  ];

  return (
    <div className="w-72 border-r border-white/5 bg-slate-900/40 backdrop-blur-3xl p-6 flex flex-col hidden md:flex h-full relative z-20 shadow-2xl">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <span className="text-lg font-bold text-white tracking-tighter">VP</span>
        </div>
        <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wide">
          Vysco PO
        </h2>
      </div>
      
      <nav className="flex flex-col gap-3 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 font-medium overflow-hidden group ${
                isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon size={20} className={`relative z-10 ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400 transition-colors"}`} />
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <ChevronRight size={16} className="ml-auto relative z-10 text-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>
      
      {user && (
        <div className="mt-auto border-t border-white/10 pt-6">
          <div className="flex items-center gap-3 mb-6 px-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
              <span className="text-slate-300 font-bold">{user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-slate-200 truncate">{user.displayName || "Admin User"}</span>
              <span className="text-xs text-slate-500 truncate">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center justify-center gap-2 p-3 w-full rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors font-semibold border border-red-500/10 group"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
