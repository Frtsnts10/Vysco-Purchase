"use client";

import { useState, useEffect } from "react";
import { Card } from "@heroui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getDashboardStats } from "@/lib/services/dashboardService";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Wallet, FileText, Truck } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    totalPengeluaran: 0,
    transactionCount: 0,
    unitTermahal: "Memuat...",
    chartData: [{ name: 'Current', pengeluaran: 0 }]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    }
    loadStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants} className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Welcome back, here's what's happening today.</p>
        </div>
      </motion.header>

      {/* Peringatan Anomali */}
      <motion.div variants={itemVariants}>
        <Card className="bg-orange-500/10 border-orange-500/20 shadow-lg shadow-orange-500/5 backdrop-blur-xl">
          <Card.Content className="flex flex-row items-start md:items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-orange-400" size={24} />
            </div>
            <div>
              <h4 className="text-orange-300 font-bold text-lg">Peringatan Anomali Harga</h4>
              <p className="text-orange-400/80 text-sm mt-1">Deteksi: Item "Filter Udara" pada PO #1029 memiliki harga 150% lebih tinggi dari rata-rata historis.</p>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
      
      <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl shadow-xl hover:bg-slate-900/60 transition-colors group">
          <Card.Content className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Pengeluaran</h3>
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Wallet className="text-blue-400" size={20} />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white">
              {isLoading ? "..." : `Rp ${stats.totalPengeluaran.toLocaleString('id-ID')}`}
            </p>
            <p className="text-emerald-400 text-sm font-medium mt-4 flex items-center gap-1">
              <TrendingUp size={16} /> +12% dari bulan lalu
            </p>
          </Card.Content>
        </Card>

        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl shadow-xl hover:bg-slate-900/60 transition-colors group">
          <Card.Content className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Jumlah Transaksi (PO)</h3>
              <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                <FileText className="text-indigo-400" size={20} />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white">
              {isLoading ? "..." : stats.transactionCount}
            </p>
            <p className="text-slate-500 text-sm font-medium mt-4">
              Dalam bulan berjalan
            </p>
          </Card.Content>
        </Card>

        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl shadow-xl hover:bg-slate-900/60 transition-colors group">
          <Card.Content className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Unit Termahal</h3>
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <Truck className="text-purple-400" size={20} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white truncate">
              {stats.unitTermahal || "-"}
            </p>
            <p className="text-slate-500 text-sm font-medium mt-4">
              Alokasi biaya tertinggi
            </p>
          </Card.Content>
        </Card>
      </motion.section>
      
      <motion.section variants={itemVariants} className="mt-4 flex-1 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-8 flex flex-col min-h-[450px] shadow-2xl relative overflow-hidden">
        {/* Glow behind chart */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />
        
        <h3 className="text-xl font-bold text-white mb-8">Grafik Tren Pengeluaran</h3>
        <div className="flex-1 w-full h-[300px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
              <YAxis 
                stroke="#94a3b8" 
                tick={{fill: '#94a3b8'}}
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `Rp ${(value / 1000000)}M`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)' }}
                itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                formatter={(value: any) => [`Rp ${Number(value || 0).toLocaleString('id-ID')}`, 'Pengeluaran']}
              />
              <Area type="monotone" dataKey="pengeluaran" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorPengeluaran)" activeDot={{ r: 8, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </motion.div>
  );
}
