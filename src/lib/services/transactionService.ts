import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export interface Transaction {
  id?: string;
  unitId: string;
  kodeUnit: string;
  supplierId: string;
  supplierNama: string;
  noPo: string;
  namaBarang: string;
  qty: number;
  satuan: string;
  hargaSatuan: number;
  dpp: number;
  ppn: number;
  tanggalOrder?: any;
  createdAt?: any;
}

const COLLECTION_NAME = "transactions";
const transactionsCol = collection(db, COLLECTION_NAME);

export const getRecentTransactions = async (max: number = 100): Promise<Transaction[]> => {
  const q = query(transactionsCol, orderBy("tanggalOrder", "desc"), limit(max));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Transaction));
};
