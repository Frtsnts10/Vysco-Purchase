import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export interface Unit {
  id?: string;
  kodeUnit: string;
  jenisUnit: string;
  sn: string;
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = "units";
const unitsCol = collection(db, COLLECTION_NAME);

export const getUnits = async (): Promise<Unit[]> => {
  const q = query(unitsCol, orderBy("kodeUnit", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Unit));
};

export const getUnit = async (id: string): Promise<Unit | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Unit;
  }
  return null;
};

export const createUnit = async (unit: Omit<Unit, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const docRef = await addDoc(unitsCol, {
    ...unit,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateUnit = async (id: string, unit: Partial<Omit<Unit, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...unit,
    updatedAt: serverTimestamp(),
  });
};

export const deleteUnit = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
