import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { getEarnings } from "@/lib/firestore";
import { Star, IndianRupee, Truck, TrendingUp } from "lucide-react";
import type { Earnings } from "@shared/schema";

type FilterPeriod = "today" | "week" | "month";

export default function History() {
  const { deliveryPartner } = useAuth();
  const { deliveryHistory, loadDeliveryHistory } = useOrders(deliveryPartner?.id);
  const [activeFilter, setActiveFilter] = useState<FilterPeriod>("today");
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [loading, setLoading] = useState(false);

  console.log("Delivery History:", deliveryHistory);

  useEffect(() => {
    if (deliveryPartner?.id) {
      loadDeliveryHistory(deliveryPartner.id);
    }
  }, [deliveryPartner]);



  // Calculate period dates
  const getPeriodDates = (period: FilterPeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case "today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) };
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: monthStart, end: new Date(today.getFullYear(), today.getMonth() + 1, 1) };
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    }
  };

  // Load data when filter changes
  useEffect(() => {
    if (!deliveryPartner) return;

    let isSubscribed = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const { start, end } = getPeriodDates(activeFilter);

        const earningsData = await getEarnings(deliveryPartner.id, start, end);

        if (isSubscribed) {
          setEarnings(earningsData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [deliveryPartner, activeFilter]);


  // Calculate summary stats
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const totalDeliveries = deliveryHistory.length;
  const averageRating = deliveryHistory.length > 0
    ? deliveryHistory.reduce((sum, order) => sum + (order.customerRating || 0), 0) / deliveryHistory.length
    : 0;

  const filteredHistory = deliveryHistory.filter(order => {
    if (!order.deliveryTime) return false;
    const { start, end } = getPeriodDates(activeFilter);
    return order.deliveryTime >= start && order.deliveryTime < end;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just Now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (!deliveryPartner) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load your data. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-24 animate-fade-in">
      {/* Earnings Summary */}
      <Card className="bg-gradient-to-br from-primary via-orange-600 to-orange-700 text-white border-0 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <CardContent className="p-6 relative">
          <h3 className="text-sm opacity-90 mb-1">
            {activeFilter === "today" ? "Today" : activeFilter === "week" ? "This Week" : "This Month"}
          </h3>
          <h2 className="text-2xl font-bold mb-6">Your Record</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-3xl font-bold mb-1" data-testid="text-total-earnings">
                ₹{totalEarnings}
              </p>
              <p className="text-xs opacity-90 font-medium">Earned</p>
            </div>
            <div className="text-center bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-3xl font-bold mb-1" data-testid="text-total-deliveries">
                {filteredHistory.length}
              </p>
              <p className="text-xs opacity-90 font-medium">Deliveries</p>
            </div>
            <div className="text-center bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-3xl font-bold mb-1" data-testid="text-average-rating">
                {averageRating.toFixed(1)}
              </p>
              <p className="text-xs opacity-90 font-medium">⭐ Star</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-1">
          <div className="flex rounded-lg">
            {(["today", "week", "month"] as FilterPeriod[]).map((period) => (
              <Button
                key={period}
                variant={activeFilter === period ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveFilter(period)}
                data-testid={`filter-${period}`}
              >
                {period === "today" ? "Today" : period === "week" ? "Week" : "Month"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery History List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-card-foreground">📜 Past Orders</h3>

        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading past orders...</p>
            </CardContent>
          </Card>
        ) : filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No deliveries found for this period.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((order) => (
            <Card key={order.id} data-testid={`card-history-${order.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-success text-white">
                      COMPLETED ✓
                    </Badge>
                    <span className="text-sm font-medium text-card-foreground">
                      #{order.id.slice(-8)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {order.deliveryTime ? getTimeAgo(order.deliveryTime) : "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground" data-testid={`text-customer-${order.id}`}>
                      {order.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Delivered at {order.customerAddress?.split(',')[0] ?? "Unknown Address"}
                    </p>
                    {order.deliveryTime && (
                      <p className="text-xs text-muted-foreground">
                        {formatTime(order.deliveryTime)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success" data-testid={`text-earnings-${order.id}`}>
                      ₹{order.deliveryFee}
                    </p>
                    {order.customerRating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-warning fill-current" />
                        <span className="text-xs text-muted-foreground">
                          {order.customerRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
