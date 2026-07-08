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

export const getSuppliers = async (): Promise<Supplier[]> => {
  const q = query(suppliersCol, orderBy("namaSupplier", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Supplier));
};

export const getSupplier = async (id: string): Promise<Supplier | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Supplier;
  }
  return null;
};

export const createSupplier = async (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const docRef = await addDoc(suppliersCol, {
    ...supplier,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateSupplier = async (id: string, supplier: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...supplier,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
