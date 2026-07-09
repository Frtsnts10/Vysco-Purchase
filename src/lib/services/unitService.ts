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

const isDummy = () => typeof window !== "undefined" && localStorage.getItem("vysco_dummy_auth") === "true";

const DUMMY_UNITS: Unit[] = [
  { id: "dummy-1", kodeUnit: "PC200-8", jenisUnit: "Excavator", sn: "J20015" },
  { id: "dummy-2", kodeUnit: "D85ESS-2", jenisUnit: "Bulldozer", sn: "K30911" },
  { id: "dummy-3", kodeUnit: "HD465-7", jenisUnit: "Dump Truck", sn: "L40200" },
  { id: "dummy-4", kodeUnit: "GD535-5", jenisUnit: "Motor Grader", sn: "G50123" }
];

export const getUnits = async (): Promise<Unit[]> => {
  if (isDummy()) return DUMMY_UNITS;
  const q = query(unitsCol, orderBy("kodeUnit", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Unit));
};

export const getUnit = async (id: string): Promise<Unit | null> => {
  if (isDummy()) return DUMMY_UNITS.find(u => u.id === id) || null;
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Unit;
  }
  return null;
};

export const createUnit = async (unit: Omit<Unit, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  if (isDummy()) {
    console.log("Dummy createUnit:", unit);
    return "dummy-" + Date.now();
  }
  const docRef = await addDoc(unitsCol, {
    ...unit,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateUnit = async (id: string, unit: Partial<Omit<Unit, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
  if (isDummy()) {
    console.log("Dummy updateUnit:", id, unit);
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...unit,
    updatedAt: serverTimestamp(),
  });
};

export const deleteUnit = async (id: string): Promise<void> => {
  if (isDummy()) {
    console.log("Dummy deleteUnit:", id);
    return;
  }
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
