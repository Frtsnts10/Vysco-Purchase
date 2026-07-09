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

const isDummy = () => typeof window !== "undefined" && localStorage.getItem("vysco_dummy_auth") === "true";

const DUMMY_TRANSACTIONS: Transaction[] = [
  { id: "dummy-1", unitId: "dummy-1", kodeUnit: "PC200-8", supplierId: "dummy-1", supplierNama: "PT Patria", noPo: "PO-1001", namaBarang: "Filter Oli", qty: 10, satuan: "Pcs", hargaSatuan: 250000, dpp: 2500000, ppn: 275000, tanggalOrder: new Date() },
  { id: "dummy-2", unitId: "dummy-2", kodeUnit: "D85ESS-2", supplierId: "dummy-2", supplierNama: "CV Mega Alat", noPo: "PO-1002", namaBarang: "Track Link", qty: 2, satuan: "Set", hargaSatuan: 45000000, dpp: 90000000, ppn: 9900000, tanggalOrder: new Date() },
  { id: "dummy-3", unitId: "dummy-3", kodeUnit: "HD465-7", supplierId: "dummy-3", supplierNama: "UD Bintang Makmur", noPo: "PO-1003", namaBarang: "Ban OTR", qty: 6, satuan: "Pcs", hargaSatuan: 12000000, dpp: 72000000, ppn: 7920000, tanggalOrder: new Date() },
];

export const getRecentTransactions = async (max: number = 100): Promise<Transaction[]> => {
  if (isDummy()) return DUMMY_TRANSACTIONS;
  const q = query(transactionsCol, orderBy("tanggalOrder", "desc"), limit(max));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Transaction));
};

export const createTransaction = async (data: Omit<Transaction, "id">) => {
  if (isDummy()) {
    console.log("Dummy createTransaction:", data);
    return { id: "dummy-" + Date.now() };
  }
  return await addDoc(transactionsCol, data);
};

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  if (isDummy()) {
    console.log("Dummy updateTransaction:", id, data);
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, data);
};

export const deleteTransaction = async (id: string) => {
  if (isDummy()) {
    console.log("Dummy deleteTransaction:", id);
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(docRef);
};
