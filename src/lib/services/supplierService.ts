import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export interface Supplier {
  id?: string;
  namaSupplier: string;
  alamat?: string;
  noTelp?: string;
  noWa?: string;
  email?: string;
  fax?: string;
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = "suppliers";
const suppliersCol = collection(db, COLLECTION_NAME);

const isDummy = () => typeof window !== "undefined" && localStorage.getItem("vysco_dummy_auth") === "true";

const DUMMY_SUPPLIERS: Supplier[] = [
  { id: "dummy-1", namaSupplier: "PT Patria", alamat: "Jakarta", noTelp: "021-123456", email: "sales@patria.co.id" },
  { id: "dummy-2", namaSupplier: "CV Mega Alat", alamat: "Surabaya", noTelp: "031-987654", email: "info@megaalat.com" },
  { id: "dummy-3", namaSupplier: "UD Bintang Makmur", alamat: "Bandung", noTelp: "022-555666", email: "bintang@makmur.id" },
];

export const getSuppliers = async (): Promise<Supplier[]> => {
  if (isDummy()) return DUMMY_SUPPLIERS;
  const q = query(suppliersCol, orderBy("namaSupplier", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Supplier));
};

export const getSupplier = async (id: string): Promise<Supplier | null> => {
  if (isDummy()) return DUMMY_SUPPLIERS.find(s => s.id === id) || null;
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Supplier;
  }
  return null;
};

export const createSupplier = async (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  if (isDummy()) {
    console.log("Dummy createSupplier:", supplier);
    return "dummy-" + Date.now();
  }
  const docRef = await addDoc(suppliersCol, {
    ...supplier,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateSupplier = async (id: string, supplier: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
  if (isDummy()) {
    console.log("Dummy updateSupplier:", id, supplier);
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...supplier,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSupplier = async (id: string): Promise<void> => {
  if (isDummy()) {
    console.log("Dummy deleteSupplier:", id);
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
