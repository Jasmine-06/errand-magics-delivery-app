import { cn } from "@/lib/utils";
import { Home, History, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: "dashboard" | "history" | "profile";
  onTabChange: (tab: "dashboard" | "history" | "profile") => void;
}

const tabs = [
  {
    id: "dashboard" as const,
    label: "Dashboard",
    icon: Home,
  },
  {
    id: "history" as const,
    label: "History",
    icon: History,
  },
  {
    id: "profile" as const,
    label: "Profile",
    icon: User,
  },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe" data-testid="bottom-navigation">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all duration-300 touch-friendly relative group",
                  isActive 
                    ? "bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg scale-110" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => onTabChange(tab.id)}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-all",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-semibold transition-all",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
