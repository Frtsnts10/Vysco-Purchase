import { collection, getAggregateFromServer, sum, count, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export const getDashboardStats = async () => {
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
    const snapshot = await getAggregateFromServer(currentMonthQuery, {
      totalDpp: sum("dpp"),
      totalPpn: sum("ppn"),
      transactionCount: count()
    });

    const data = snapshot.data();
    
    // Total Pengeluaran
    const totalPengeluaran = (data.totalDpp || 0) + (data.totalPpn || 0);
    
    // For unit termahal, we'd ideally use a complex group by, but firestore 
    // doesn't support GROUP BY natively yet. We'll leave it as a placeholder 
    // or return a mock value for now. 

    return {
      totalPengeluaran,
      transactionCount: data.transactionCount || 0,
      unitTermahal: "Memuat..." // Placeholder, would need a custom aggregation function
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalPengeluaran: 0,
      transactionCount: 0,
      unitTermahal: "-"
    };
  }
};
