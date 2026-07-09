import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export const getDashboardStats = async () => {
  // If using dummy account, return mock data directly
  if (typeof window !== "undefined" && localStorage.getItem("vysco_dummy_auth") === "true") {
    return {
      totalPengeluaran: 145000000, // Rp 145M
      transactionCount: 24,
      unitTermahal: "PC200-8",
      chartData: [
        { name: 'Jan', pengeluaran: 40000000 },
        { name: 'Feb', pengeluaran: 30000000 },
        { name: 'Mar', pengeluaran: 20000000 },
        { name: 'Apr', pengeluaran: 27800000 },
        { name: 'May', pengeluaran: 18900000 },
        { name: 'Jun', pengeluaran: 23900000 },
        { name: 'Jul', pengeluaran: 34900000 },
      ]
    };
  }

  const transactionsCol = collection(db, "transactions");
  
  // Get current month's start and end dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const currentMonthQuery = query(
    transactionsCol,
    where("tanggalOrder", ">=", startOfMonth),
    where("tanggalOrder", "<=", endOfMonth)
  );

  try {
    const snapshot = await getDocs(currentMonthQuery);
    let totalDpp = 0;
    let totalPpn = 0;
    let maxHargaSatuan = 0;
    let unitTermahal = "-";

    snapshot.forEach((doc) => {
      const d = doc.data();
      totalDpp += (d.dpp || 0);
      totalPpn += (d.ppn || 0);
      
      if (d.hargaSatuan > maxHargaSatuan) {
        maxHargaSatuan = d.hargaSatuan;
        unitTermahal = d.kodeUnit || "-";
      }
    });

    const transactionCount = snapshot.size;
    
    // Group by month for the chart
    const monthlyData: Record<string, number> = {};
    snapshot.forEach((doc) => {
      const d = doc.data();
      const date = d.tanggalOrder?.toDate ? d.tanggalOrder.toDate() : new Date(d.tanggalOrder || Date.now());
      const monthName = date.toLocaleString('default', { month: 'short' });
      monthlyData[monthName] = (monthlyData[monthName] || 0) + ((d.dpp || 0) + (d.ppn || 0));
    });

    // Format for Recharts
    const chartData = Object.keys(monthlyData).map(month => ({
      name: month,
      pengeluaran: monthlyData[month]
    }));

    const totalPengeluaran = totalDpp + totalPpn;

    return {
      totalPengeluaran,
      transactionCount: transactionCount,
      unitTermahal: unitTermahal || "-",
      chartData: chartData.length > 0 ? chartData : [{ name: 'Current', pengeluaran: 0 }]
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalPengeluaran: 0,
      transactionCount: 0,
      unitTermahal: "-",
      chartData: [{ name: 'Current', pengeluaran: 0 }]
    };
  }
};
