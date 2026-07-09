"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { LogOut } from "lucide-react";

export function Sidebar() {
  const { signOut, user } = useAuth();

  return (
    <div className="w-64 border-r border-default-200 p-4 flex flex-col hidden md:flex h-full bg-background">
      <h2 className="text-xl font-bold text-primary mb-8 px-2">Vysco PO</h2>
      <nav className="flex flex-col gap-2 flex-1">
        <Link href="/" className="p-2 rounded-md hover:bg-default-100 transition-colors font-medium">
          Dashboard
        </Link>
        <Link href="/units" className="p-2 rounded-md hover:bg-default-100 transition-colors font-medium">
          Units
        </Link>
        <Link href="/suppliers" className="p-2 rounded-md hover:bg-default-100 transition-colors font-medium">
          Suppliers
        </Link>
        <Link href="/transactions" className="p-2 rounded-md hover:bg-default-100 transition-colors font-medium">
          Transactions
        </Link>
      </nav>
      
      {user && (
        <div className="mt-auto border-t border-default-200 pt-4">
          <button 
            onClick={signOut}
            className="flex items-center gap-2 p-2 w-full rounded-md hover:bg-danger-50 hover:text-danger transition-colors font-medium text-default-600"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
