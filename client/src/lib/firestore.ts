import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  setDoc,
  documentId,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { type Order, type DeliveryPartner, type Delivery, type Earnings } from "@shared/schema";

console.log("firestore.ts version 2.2 (Emergency Fix)");

// Collections
export const COLLECTIONS = {
  DELIVERY_PARTNERS: "deliveryPartners",
  ORDERS: "orders",
  DELIVERIES: "deliveries",
  EARNINGS: "earnings",
  FCM_TOKENS: "fcmTokens",
} as const;

type DeliveryPartnerForm = {
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  password: string;
};

export const createDeliveryPartner = async (userId: string, data: Omit<DeliveryPartnerForm, 'password'>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.DELIVERY_PARTNERS, userId);
    await setDoc(docRef, {
      id: userId,
      ...data,
      adminApproved: false,
      status: "offline",
      rating: 0,
      totalDeliveries: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error: any) {
    throw error;
  }
};

export const createUserRecord = async (userId: string, data: { name: string, email: string, phone: string }): Promise<void> => {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, {
      id: userId,
      ...data,
      role: "delivery_partner",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        notifications: true,
        theme: "light",
        language: "en",
        currency: "INR"
      }
    });
  } catch (error) {
    console.error("Error creating user record:", error);
    // Don't throw, as the deliveryPartner record is more important for this app
  }
};

export async function createDeliveryRecord(data: any) {
  try {
    await setDoc(doc(collection(db, COLLECTIONS.DELIVERIES), data.id), data);
  } catch (err) {
    throw err;
  }
}

// Delivery Partner operations
export const getDeliveryPartner = async (id: string): Promise<DeliveryPartner | null> => {
  console.log(`FETCHING delivery partner with ID: ${id}`);
  try {
    const docRef = doc(db, COLLECTIONS.DELIVERY_PARTNERS, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`FOUND delivery partner:`, data.name);
      return {
        ...data,
        id: docSnap.id,
      } as DeliveryPartner;
    } else {
      console.warn(`Delivery partner profile NOT FOUND for ID: ${id}`);
    }
  } catch (error) {
    console.error(`ERROR fetching delivery partner:`, error);
  }
  return null;
};

export const subscribeDeliveryPartner = (
  id: string,
  callback: (partner: DeliveryPartner | null) => void
): (() => void) => {
  const docRef = doc(db, COLLECTIONS.DELIVERY_PARTNERS, id);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({
        ...docSnap.data(),
        id: docSnap.id,
      } as DeliveryPartner);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`ERROR subscribing to delivery partner:`, error);
    callback(null);
  });
};

export const updateDeliveryPartnerStatus = async (
  partnerId: string,
  status: DeliveryPartner['status']
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.DELIVERY_PARTNERS, partnerId);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

// Order operations
export const getAvailableOrders = (
  callback: (orders: Order[]) => void
): (() => void) => {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where("status", "==", "confirmed")
  );
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      } as Order;
    });
    callback(orders);
  });
};

export const getPartnerActiveOrders = (
  partnerId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  const deliveriesQ = query(
    collection(db, COLLECTIONS.DELIVERIES),
    where("deliveryPartnerId", "==", partnerId),
    where("status", "==", "active"),
    orderBy("startTime", "desc")
  );

  return onSnapshot(deliveriesQ, async (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const orderIds = snapshot.docs.map(doc => doc.data().orderId).filter(Boolean);
    if (orderIds.length === 0) {
      callback([]);
      return;
    }
    const orders = await getOrdersByIds(orderIds);
    callback(orders);
  });
};

export async function getOrdersByIds(orderIds: string[]): Promise<Order[]> {
  const chunks: string[][] = [];
  let temp = [...orderIds];
  while (temp.length > 0) chunks.push(temp.splice(0, 10));
  const results: any[] = [];
  for (const chunk of chunks) {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where(documentId(), "in", chunk)
    );
    const snap = await getDocs(q);
    snap.forEach((doc) => {
      const data = doc.data();
      results.push({
        ...data,
        id: doc.id,
        createdAt: toDateSafe(data.createdAt),
        updatedAt: toDateSafe(data.updatedAt),
        pickupTime: toDateSafe(data.pickupTime),
        deliveryTime: toDateSafe(data.deliveryTime),
        estimatedDeliveryTime: toDateSafe(data.estimatedDeliveryTime),
      });
    });
  }
  return results;
}

function toDateSafe(value: any) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  partnerId?: string
): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const orderSnap = await getDoc(docRef);
  if (!orderSnap.exists()) return;

  const orderData = orderSnap.data() as Order;
  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (partnerId && status === "accepted") {
    updateData.deliveryPartnerId = partnerId;
  }
  if (status === "picked_up") {
    updateData.pickupTime = serverTimestamp();
  }
  if (status === "delivered") {
    updateData.deliveryTime = serverTimestamp();
  }
  if (partnerId) {
    const partnerRef = doc(db, COLLECTIONS.DELIVERY_PARTNERS, partnerId);
    await updateDoc(partnerRef, {
      totalDeliveries: increment(1),
      updatedAt: serverTimestamp(),
    });
  }
  if (orderData.paymentMethod === "cash_on_delivery") {
    updateData.paymentDetails = {
      verificationStatus: "verified",
      verificationDate: new Date().toISOString(),
    };
  }
  await updateDoc(docRef, updateData);
};

export const getDeliveryHistory = async (
  partnerId: string,
  limitCount: number = 50
): Promise<Order[]> => {
  const deliveriesQ = query(
    collection(db, COLLECTIONS.DELIVERIES),
    where("deliveryPartnerId", "==", partnerId),
    where("status", "==", "active"),
    orderBy("startTime", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(deliveriesQ);
  if (snap.empty) return [];
  const orderIds = snap.docs.map(doc => doc.data().orderId).filter(Boolean);
  if (orderIds.length === 0) return [];
  const orders = await getOrdersByIds(orderIds);
  return orders.sort((a, b) => (b.deliveryTime?.getTime() || 0) - (a.deliveryTime?.getTime() || 0));
};

export const getEarnings = async (
  partnerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Earnings[]> => {
  let q = query(
    collection(db, COLLECTIONS.EARNINGS),
    where("deliveryPartnerId", "==", partnerId),
    orderBy("date", "desc")
  );
  if (startDate) q = query(q, where("date", ">=", Timestamp.fromDate(startDate)));
  if (endDate) q = query(q, where("date", "<=", Timestamp.fromDate(endDate)));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      date: data.date?.toDate(),
    } as Earnings;
  });
};

export const addEarnings = async (earnings: Omit<Earnings, 'id'>): Promise<void> => {
  await addDoc(collection(db, COLLECTIONS.EARNINGS), {
    ...earnings,
    date: Timestamp.fromDate(earnings.date),
  });
};

export const saveFcmToken = async (userId: string, token: string): Promise<void> => {
  const tokenRef = doc(db, COLLECTIONS.FCM_TOKENS, userId);
  await setDoc(tokenRef, {
    userId,
    token,
    updatedAt: serverTimestamp(),
  });
};
