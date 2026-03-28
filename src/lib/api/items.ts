import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface Item {
  id?: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  pricePerDay: number;
  images: string[];
  availabilityStatus: "available" | "rented" | "maintenance";
  reviewsCount: number;
  averageRating: number;
  createdAt: any;
}

const ITEMS_COLLECTION = "items";

export const addItem = async (item: Omit<Item, "id" | "createdAt" | "reviewsCount" | "averageRating">) => {
  const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
    ...item,
    reviewsCount: 0,
    averageRating: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getItems = async (category?: string) => {
  let q = collection(db, ITEMS_COLLECTION);
  if (category && category !== "all") {
    // @ts-ignore
    q = query(q, where("category", "==", category));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
};

export const getItem = async (id: string) => {
  const docRef = doc(db, ITEMS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Item;
  }
  return null;
};

export const updateItemImages = async (id: string, images: string[]) => {
  const docRef = doc(db, ITEMS_COLLECTION, id);
  await updateDoc(docRef, { images });
};

export const uploadItemImage = async (file: File, itemId: string) => {
  const storageRef = ref(storage, `items/${itemId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};
