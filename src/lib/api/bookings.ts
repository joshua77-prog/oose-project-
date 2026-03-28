import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore";

export interface Booking {
  id?: string;
  renterId: string;
  ownerId: string;
  itemId: string;
  startDate: any;
  endDate: any;
  totalFee: number;
  status: "pending" | "active" | "completed" | "cancelled";
  createdAt: any;
}

const BOOKINGS_COLLECTION = "bookings";

export const createBooking = async (booking: Omit<Booking, "id" | "createdAt" | "status">) => {
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    ...booking,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getBookings = async (userId: string, role: "renter" | "owner") => {
  const field = role === "renter" ? "renterId" : "ownerId";
  const q = query(collection(db, BOOKINGS_COLLECTION), where(field, "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
};

export const updateBookingStatus = async (id: string, status: Booking["status"]) => {
  const docRef = doc(db, BOOKINGS_COLLECTION, id);
  await updateDoc(docRef, { status });
};
