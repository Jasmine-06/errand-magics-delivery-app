import { useState, useEffect } from "react";
import {
  getAvailableOrders,
  getPartnerActiveOrders,
  updateOrderStatus,
  getDeliveryHistory,
  addEarnings,
  createDeliveryRecord,
} from "@/lib/firestore";
import type { Order } from "@shared/schema";
import { Timestamp } from "firebase/firestore";

interface OrdersState {
  availableOrders: Order[];
  activeOrders: Order[];
  deliveryHistory: Order[];
  loading: boolean;
  error: string | null;
}

interface OrdersActions {
  acceptOrder: (orderId: string, partnerId: string) => Promise<void>;
  declineOrder: (orderId: string) => Promise<void>;
  markAsPickedUp: (orderId: string) => Promise<void>;
  markAsEnRoute: (orderId: string) => Promise<void>;
  markAsDelivered: (orderId: string, partnerId: string, amount?: number) => Promise<void>;
  loadDeliveryHistory: (partnerId: string) => Promise<void>;
  clearError: () => void;
}

export function useOrders(partnerId?: string): OrdersState & OrdersActions {
  const [state, setState] = useState<OrdersState>({
    availableOrders: [],
    activeOrders: [],
    deliveryHistory: [],
    loading: false,
    error: null,
  });

  const refreshActiveOrders = () => {
    if (!partnerId) return;
    getPartnerActiveOrders(partnerId, (orders) => {
      setState((prev) => ({ ...prev, activeOrders: orders }));
    });
  };

  const refreshDeliveryHistory = async () => {
    if (!partnerId) return;
    const history = await getDeliveryHistory(partnerId);
    setState((prev) => ({ ...prev, deliveryHistory: history }));
  };

  useEffect(() => {
    if (!partnerId) return;

    setState(prev => ({ ...prev, loading: true }));

    const unsubscribeAvailable = getAvailableOrders((orders) => {
      setState(prev => ({
        ...prev,
        availableOrders: orders,
        loading: false
      }));
    });

    const unsubscribeActive = getPartnerActiveOrders(partnerId, (orders) => {
      setState(prev => ({
        ...prev,
        activeOrders: orders
      }));
    });
    getDeliveryHistory(partnerId).then(history => {
      setState(prev => ({
        ...prev,
        deliveryHistory: history,
      }));
    });

    return () => {
      unsubscribeAvailable();
      unsubscribeActive();

    };
  }, [partnerId]);

  const acceptOrder = async (orderId: string, partnerId: string): Promise<void> => {
    try {
      await updateOrderStatus(orderId, "accepted", partnerId);

      const order = state.availableOrders.find(o => o.id === orderId);
      if (!order) return;

      await createDeliveryRecord({
        id: crypto.randomUUID(),
        orderId,
        deliveryPartnerId: partnerId,
        earnings: 0,
        startTime: Timestamp.now(),
        distance: Number(order.distance ?? 0),
        status: "active",
        createdAt: new Date(),
      });
      refreshActiveOrders();

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to accept order",
      }));
      throw error;
    }
  };


  const declineOrder = async (orderId: string): Promise<void> => {
    try {
      // In a real app, you might want to track declined orders
      // For now, we'll just remove it from available orders locally
      setState(prev => ({
        ...prev,
        availableOrders: prev.availableOrders.filter(order => order.id !== orderId),
      }));

      refreshActiveOrders();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to decline order",
      }));
      throw error;
    }
  };

  const markAsPickedUp = async (orderId: string): Promise<void> => {
    try {
      await updateOrderStatus(orderId, "picked_up");
      refreshActiveOrders();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to mark order as picked up",
      }));
      throw error;
    }
  };

  const markAsEnRoute = async (orderId: string): Promise<void> => {
    try {
      await updateOrderStatus(orderId, "en_route");
      refreshActiveOrders();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to mark order as en route",
      }));
      throw error;
    }
  };

  const markAsDelivered = async (orderId: string, partnerId: string, amount?: number): Promise<void> => {
    try {
      await updateOrderStatus(orderId, "delivered", partnerId);

      // Find the order to get delivery fee
      const order = state.activeOrders.find(o => o.id === orderId);
      if (order) {
        // Add earnings record
        await addEarnings({
          deliveryPartnerId: partnerId,
          orderId,
          amount: amount !== undefined ? amount : order.deliveryFee,
          date: new Date(),
          type: "delivery_fee",
        });
      }

      refreshActiveOrders();
      await refreshDeliveryHistory();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to mark order as delivered",
      }));
      throw error;
    }
  };

  const loadDeliveryHistory = async (partnerId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const history = await getDeliveryHistory(partnerId);
      setState(prev => ({
        ...prev,
        deliveryHistory: history,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load delivery history",
      }));
      throw error;
    }
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    acceptOrder,
    declineOrder,
    markAsPickedUp,
    markAsEnRoute,
    markAsDelivered,
    loadDeliveryHistory,
    clearError,
  };
}


