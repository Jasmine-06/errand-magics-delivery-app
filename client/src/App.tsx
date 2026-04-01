import { useState } from "react";
import { useAuth } from "./hooks/use-auth";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import HistoryPage from "./pages/history";
import ProfilePage from "./pages/profile";
import { BottomNavigation } from "./components/bottom-navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

type Page = "dashboard" | "history" | "profile";

import { getToken } from "firebase/messaging";
import { messaging, VAPID_KEY } from "./lib/firebase";
import { saveFcmToken } from "./lib/firestore";
import { useEffect } from "react";

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState<Page>("dashboard");

  console.log("App initialized. API KEY present:", !!import.meta.env.VITE_FIREBASE_API_KEY);
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.error("CRITICAL: VITE_FIREBASE_API_KEY is missing in App.tsx!");
  }

  useEffect(() => {
    if (user && messaging) {
      const setupNotifications = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) {
              await saveFcmToken(user.uid, token);
            }
          }
        } catch (error) {
          console.error("Failed to setup FCM:", error);
        }
      };
      setupNotifications();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {activePage === "dashboard" && <DashboardPage />}
      {activePage === "history" && <HistoryPage />}
      {activePage === "profile" && <ProfilePage />}

      <BottomNavigation
        activeTab={activePage}
        onTabChange={setActivePage}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
