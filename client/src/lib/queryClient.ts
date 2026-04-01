import { QueryClient } from "@tanstack/react-query";

// Firebase-only backend - simplified query client
// All data operations handled by Firebase Firestore directly
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for Firebase data
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
