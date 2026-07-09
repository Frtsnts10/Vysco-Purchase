"use client";

import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Memuat...</div>;
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10 bg-slate-950/50 backdrop-blur-sm">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
