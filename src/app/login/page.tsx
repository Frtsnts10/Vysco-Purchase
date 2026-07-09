"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Card, Button, Input } from "@heroui/react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.push("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    // DUMMY ACCOUNT BYPASS
    if (email === "admin@vysco.com" && password === "admin123") {
      localStorage.setItem("vysco_dummy_auth", "true");
      window.location.href = "/";
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError("Email atau kata sandi salah. Silakan coba lagi.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="p-8 bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl">
          <Card.Header className="flex flex-col items-center gap-3 mb-6">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2"
            >
              <span className="text-2xl font-bold text-white tracking-tighter">VP</span>
            </motion.div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Vysco PO
            </h1>
            <p className="text-slate-400 text-sm font-medium">Dasbor Manajemen Pembelian</p>
          </Card.Header>
          
          <Card.Content>
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="admin@vysco.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl px-4 py-2 hover:bg-slate-800 focus-within:!bg-slate-800 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl px-4 py-2 hover:bg-slate-800 focus-within:!bg-slate-800 transition-colors"
                />
              </div>
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                >
                  {error}
                </motion.p>
              )}
              
              <Button 
                variant="primary" 
                type="submit" 
                isDisabled={isLoggingIn} 
                className="mt-4 w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all border-none"
              >
                {isLoggingIn ? "Memuat..." : "Masuk ke Sistem"}
              </Button>
            </form>
          </Card.Content>
        </Card>
        
        <p className="text-center text-slate-500 text-xs mt-8 font-medium">
          &copy; 2026 PT Vysco. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
