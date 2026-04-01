import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { 
  User, 
  Truck, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut,
  Star,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { deliveryPartner, logout, loading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
    } catch (error) {
      toast({
        title: "Failed to sign out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleMenuClick = (item: string) => {
    toast({
      title: `${item} clicked`,
      description: "This feature will be available soon",
    });
  };

  if (!deliveryPartner) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load profile information. Please contact support if this persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const menuItems = [
    {
      icon: User,
      label: "Edit Profile",
      color: "bg-primary bg-opacity-10 text-primary",
      onClick: () => handleMenuClick("Edit Profile"),
    },
    {
      icon: Truck,
      label: "Vehicle Details",
      color: "bg-blue-500 bg-opacity-10 text-blue-500",
      onClick: () => handleMenuClick("Vehicle Details"),
    },
    {
      icon: CreditCard,
      label: "Payment Settings",
      color: "bg-success bg-opacity-10 text-success",
      onClick: () => handleMenuClick("Payment Settings"),
    },
    {
      icon: Bell,
      label: "Notifications",
      color: "bg-warning bg-opacity-10 text-warning",
      onClick: () => handleMenuClick("Notifications"),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      color: "bg-muted text-muted-foreground",
      onClick: () => handleMenuClick("Help & Support"),
    },
  ];

  return (
    <div className="p-4 space-y-5 pb-24 animate-fade-in">
      {/* Profile Header */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-orange-600 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <CardContent className="p-6 -mt-12 relative">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white">
            <span className="text-3xl font-bold text-white">
              {deliveryPartner.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-1" data-testid="text-profile-name">
              {deliveryPartner.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Delivery Partner • ID: {deliveryPartner.id.slice(-8)}
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold" data-testid="text-profile-rating">
                    {deliveryPartner.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-xl font-bold" data-testid="text-profile-deliveries">
                    {deliveryPartner.totalDeliveries}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Deliveries</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full bg-card p-4 rounded-lg shadow-sm border border-border h-auto justify-start hover:bg-accent"
              onClick={item.onClick}
              data-testid={`button-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-card-foreground">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Button>
          );
        })}

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          className="w-full bg-card p-4 rounded-lg shadow-sm border border-border h-auto justify-start hover:bg-accent"
          onClick={handleLogout}
          disabled={loading}
          data-testid="button-sign-out"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive bg-opacity-10 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <span className="font-medium text-card-foreground">
                {loading ? "Signing out..." : "Sign Out"}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Button>
      </div>

      {/* App Info */}
      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground mb-1">ErrandMagics Delivery Partner</p>
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
      </div>
    </div>
  );
}
