import { collection, query, orderBy, limit, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
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

export const createTransaction = async (data: Omit<Transaction, "id">) => {
  return await addDoc(transactionsCol, data);
};

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, data);
};

export const deleteTransaction = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(docRef);
};
