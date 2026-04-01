import { z } from "zod";

// User/Delivery Partner Schema
export const deliveryPartnerSchema = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  status: z.enum(["online", "offline", "busy"]),
  vehicleType: z.string(),
  vehicleNumber: z.string(),
  adminApproved: z.boolean(),
  rating: z.number().min(0).max(5),
  totalDeliveries: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertDeliveryPartnerSchema = deliveryPartnerSchema.omit({
  id: true,
  rating: true,
  totalDeliveries: true,
  createdAt: true,
  updatedAt: true,
});

// Order Schema
export const orderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerAddress: z.string(),

  storeId: z.string(),
  storeName: z.string(),
  storeAddress: z.string(),

  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
  ),

  orderValue: z.number(),
  deliveryFee: z.number(),

  status: z.enum([
    "new",
    "confirmed",
    "accepted",
    "picked_up",
    "en_route",
    "delivered",
    "cancelled",
  ]),

  paymentMethod: z.enum(["cash_on_delivery", "online", "wallet"]).optional(),
  paymentDetails: z.object({
    verificationStatus: z.string().optional(),
    verificationDate: z.string().optional(),
  }).optional(),

  deliveryPartnerId: z.string().optional(),

  pickupTime: z.date().optional(),
  deliveryTime: z.date().optional(),
  estimatedDeliveryTime: z.date().optional(),

  customerRating: z.number().min(1).max(5).optional(),
  customerFeedback: z.string().optional(),

  distance: z.number(),
  deliveryDistance: z.number(),

  storeLat: z.number().optional(),
  storeLng: z.number().optional(),
  customerLat: z.number().optional(),
  customerLng: z.number().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});


export const insertOrderSchema = orderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Delivery Schema
export const deliverySchema = z.object({
  id: z.string(),
  orderId: z.string(),
  deliveryPartnerId: z.string(),
  earnings: z.number(),
  startTime: z.date(),
  endTime: z.date().optional(),
  distance: z.number(),
  customerRating: z.number().min(1).max(5).optional(),
  status: z.enum(["active", "completed", "cancelled"]),
  createdAt: z.date(),
});

export const insertDeliverySchema = deliverySchema.omit({
  id: true,
  createdAt: true,
});

// Earnings Schema
export const earningsSchema = z.object({
  id: z.string(),
  deliveryPartnerId: z.string(),
  orderId: z.string(),
  amount: z.number(),
  date: z.date(),
  type: z.enum(["delivery_fee", "tip", "bonus"]),
});

export const insertEarningsSchema = earningsSchema.omit({
  id: true,
});

// Types
export type DeliveryPartner = z.infer<typeof deliveryPartnerSchema>;
export type InsertDeliveryPartner = z.infer<typeof insertDeliveryPartnerSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Delivery = z.infer<typeof deliverySchema>;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Earnings = z.infer<typeof earningsSchema>;
export type InsertEarnings = z.infer<typeof insertEarningsSchema>;
