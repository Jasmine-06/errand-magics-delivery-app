import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signIn, signOutUser, getAuthErrorMessage, type AuthError } from "@/lib/auth";
import { subscribeDeliveryPartner } from "@/lib/firestore";
import type { DeliveryPartner } from "@shared/schema";

console.log("use-auth.ts version 2.2 (Emergency Fix)");

interface AuthState {
  user: User | null;
  deliveryPartner: DeliveryPartner | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    deliveryPartner: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let unsubscribePartner: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clean up previous partner listener if any
      if (unsubscribePartner) {
        unsubscribePartner();
        unsubscribePartner = null;
      }

      if (user) {
        setState(prev => ({ ...prev, user, loading: true }));

        // Listen to live updates of the delivery partner profile
        unsubscribePartner = subscribeDeliveryPartner(user.uid, (partner) => {
          setState({
            user,
            deliveryPartner: partner,
            loading: false,
            error: null,
          });
        });
      } else {
        setState({
          user: null,
          deliveryPartner: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePartner) unsubscribePartner();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await signIn(email, password);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: getAuthErrorMessage(error as AuthError),
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await signOutUser();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to sign out",
      }));
      throw error;
    }
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    login,
    logout,
    clearError,
  };
}
