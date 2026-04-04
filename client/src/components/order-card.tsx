import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Navigation, MessageCircle, Package, CheckCircle, MapPin } from "lucide-react";
import type { Order } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { calculateDistance, calculateSuggestedFee } from "@/lib/location-utils";
import { MapView } from "./map-view";

interface OrderCardProps {
  order: Order;
  currentLocation?: { lat: number; lng: number };
  onAccept?: () => void;
  onDecline?: () => void;
  onMarkPickedUp?: () => void;
  onMarkEnRoute?: () => void;
  onMarkDelivered?: (amount: number) => void;
  onCall?: () => void;
  onMessage?: () => void;
  onNavigate?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: {
    label: "NEW",
    className: "bg-blue-500 hover:bg-blue-600",
  },
  confirmed: {
    label: "CONFIRMED",
    className: "bg-blue-600 hover:bg-blue-700",
  },
  accepted: {
    label: "PICK UP",
    className: "bg-warning hover:bg-warning/90",
  },
  picked_up: {
    label: "EN ROUTE",
    className: "bg-purple-500 hover:bg-purple-600",
  },
  en_route: {
    label: "EN ROUTE",
    className: "bg-purple-500 hover:bg-purple-600",
  },
  delivered: {
    label: "COMPLETED",
    className: "bg-success hover:bg-success/90",
  },
  cancelled: {
    label: "CANCEL",
    className: "bg-destructive hover:bg-destructive/90",
  },
};

export function OrderCard({
  order,
  currentLocation: currentLoc,
  onAccept,
  onDecline,
  onMarkPickedUp,
  onMarkEnRoute,
  onMarkDelivered,
  onCall,
  onMessage,
  onNavigate,
}: OrderCardProps) {
  const [showMap, setShowMap] = useState(false);
  const status = statusConfig[order.status] ?? { label: "UNKNOWN", className: "bg-gray-500" };
  const timeAgo = getTimeAgo(order.createdAt);

  // Fallback coordinates for Errand Magics center if data is missing
  const ERRAND_MAGICS_CENTER = { lat: 23.6681, lng: 87.6837 };
  const storePos = {
    lat: order.storeLat || ERRAND_MAGICS_CENTER.lat,
    lng: order.storeLng || ERRAND_MAGICS_CENTER.lng
  };
  const customerPos = {
    lat: order.customerLat || (ERRAND_MAGICS_CENTER.lat + 0.01),
    lng: order.customerLng || (ERRAND_MAGICS_CENTER.lng + 0.01)
  };

  const pickupDistance = useMemo(() => {
    if (!currentLoc) return order.distance || 1.5; // Demo fallback
    return calculateDistance(currentLoc.lat, currentLoc.lng, storePos.lat, storePos.lng);
  }, [currentLoc, storePos, order.distance]);

  const deliveryDistance = useMemo(() => {
    return calculateDistance(storePos.lat, storePos.lng, customerPos.lat, customerPos.lng);
  }, [storePos, customerPos]);

  const dynamicFee = useMemo(() => {
    const totalDist = pickupDistance + deliveryDistance;
    return calculateSuggestedFee(totalDist);
  }, [pickupDistance, deliveryDistance]);

  const totalValue =
    order.items?.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    ) ?? 0;

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/50 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-white text-xs font-semibold px-3 py-1 shadow-sm", status.className)}>
              {status.label}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">
              #{order.id.slice(-8)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {timeAgo}
          </span>
        </div>

        <div className="space-y-4">
          {/* Store Information */}
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg border-l-4 border-red-500">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge className="bg-red-500 dark:bg-red-600 hover:bg-red-600 text-white text-[10px] px-2 py-0">PICK UP</Badge>
                <p className="font-bold text-sm text-foreground">
                  {order.storeName}
                </p>
              </div>
              <p className="text-xs text-foreground/80 dark:text-foreground/70 line-clamp-1">
                {order.storeAddress}
              </p>
            </div>
            <Badge
              variant="outline"
              className="flex-shrink-0 font-semibold border-foreground/20 text-foreground"
            >
              {pickupDistance.toFixed(1)} km
            </Badge>
          </div>

          {/* Customer Information */}
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg border-l-4 border-green-600">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge className="bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white text-[10px] px-2 py-0">DELIVER</Badge>
                <p className="font-bold text-sm text-foreground">
                  {order.customerName}
                </p>
              </div>
              <p className="text-xs text-foreground/80 dark:text-foreground/70 line-clamp-1">
                {order.customerAddress}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant="outline"
                className="font-semibold border-foreground/20 text-foreground"
              >
                {deliveryDistance.toFixed(1)} km
              </Badge>
              {onNavigate && (
                <Button
                  size="sm"
                  className="h-9 w-9 p-0 bg-primary hover:bg-primary/90 rounded-full shadow-sm"
                  onClick={onNavigate}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs gap-2 py-4"
              onClick={() => setShowMap(!showMap)}
            >
              <Navigation className="w-3 h-3" />
              {showMap ? "Hide Map" : "View on Map"}
            </Button>

            {showMap && (
              <MapView
                storeLoc={storePos}
                customerLoc={customerPos}
                partnerLoc={currentLoc || undefined}
              />
            )}
          </div>
        </div>

        {/* Order Value and Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex gap-6">
            {order?.paymentMethod === "cash_on_delivery" && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Order Value</p>
                <p className="text-lg font-bold text-foreground">
                  ${totalValue}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-1">You Earn</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-500">
                ${dynamicFee}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {order.status === "confirmed" && (
              <>
                {onDecline && (
                  <Button variant="outline" size="sm" onClick={onDecline}>
                    No
                  </Button>
                )}
                {onAccept && (
                  <Button size="sm" onClick={onAccept}>
                    Yes, Accept
                  </Button>
                )}
              </>
            )}

            {order.status === "accepted" && (
              <>
                {onMarkPickedUp && (
                  <Button
                    className="bg-warning text-white hover:bg-warning/90"
                    size="sm"
                    onClick={onMarkPickedUp}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Picked Up
                  </Button>
                )}
                {onCall && (
                  <Button variant="outline" size="sm" onClick={onCall}>
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}

            {(order.status === "picked_up" || order.status === "en_route") && (
              <>
                {onMarkDelivered && (
                  <Button
                    className="bg-success text-white hover:bg-success/90"
                    size="sm"
                    onClick={() => onMarkDelivered(dynamicFee)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Delivered
                  </Button>
                )}
                {onCall && (
                  <Button variant="outline" size="sm" onClick={onCall}>
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
                {onMessage && (
                  <Button variant="outline" size="sm" onClick={onMessage}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Just Now";
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}
