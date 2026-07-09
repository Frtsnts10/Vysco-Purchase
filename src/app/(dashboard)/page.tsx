"use client";

import { useState, useEffect } from "react";
import { Card } from "@heroui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from "@/lib/services/dashboardService";

 
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
      const data = await getDashboardStats();
      setStats(data);
      setIsLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-default-200"></div>
        </div>
      </header>

      {/* Peringatan Anomali Placeholder */}
      <Card className="bg-warning-50 border-warning-200 shadow-none">
        <Card.Content className="flex flex-row items-center gap-3">
          <div className="text-warning-600 font-bold text-xl">⚠️</div>
          <div>
            <h4 className="text-warning-700 font-semibold">Peringatan Anomali Harga</h4>
            <p className="text-warning-600 text-sm">Deteksi: Item "Filter Udara" pada PO #1029 memiliki harga 150% lebih tinggi dari rata-rata historis.</p>
          </div>
        </Card.Content>
      </Card>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-2">
          <Card.Content>
            <h3 className="text-default-500 text-sm font-medium uppercase">Total Pengeluaran (Bulan Ini)</h3>
            <p className="text-3xl font-bold mt-2">
              {isLoading ? "..." : `Rp ${stats.totalPengeluaran.toLocaleString('id-ID')}`}
            </p>
          </Card.Content>
        </Card>
        <Card className="p-2">
          <Card.Content>
            <h3 className="text-default-500 text-sm font-medium uppercase">Jumlah Transaksi (PO)</h3>
            <p className="text-3xl font-bold mt-2">
              {isLoading ? "..." : stats.transactionCount}
            </p>
          </Card.Content>
        </Card>
        <Card className="p-2">
          <Card.Content>
            <h3 className="text-default-500 text-sm font-medium uppercase">Unit Termahal (Placeholder)</h3>
            <p className="text-3xl font-bold mt-2">{stats.unitTermahal}</p>
          </Card.Content>
        </Card>
      </section>
      
      <section className="mt-4 flex-1 rounded-xl border border-default-200 bg-background p-6 flex flex-col min-h-[400px]">
        <h3 className="text-lg font-bold mb-6">Grafik Tren Pengeluaran</h3>
        <div className="flex-1 w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `Rp ${(value / 1000000)}M`}
              />
              <Tooltip 
                formatter={(value: any) => [`Rp ${Number(value || 0).toLocaleString('id-ID')}`, 'Pengeluaran']}
              />
              <Line type="monotone" dataKey="pengeluaran" stroke="#006FEE" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
