import { useEffect, useRef } from "react";

// We'll use Leaflet via CDN to avoid complex dependency management in this environment.
// This component will dynamically load Leaflet if it's not present.

interface MapViewProps {
    storeLoc: { lat: number; lng: number };
    customerLoc: { lat: number; lng: number };
    partnerLoc?: { lat: number; lng: number };
}

export function MapView({ storeLoc, customerLoc, partnerLoc }: MapViewProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Load Leaflet CSS
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        // Load Leaflet JS
        const scriptId = "leaflet-js";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.async = true;
            script.onload = () => initMap();
            document.head.appendChild(script);
        } else {
            // If script is already there, it might still be loading or already loaded
            if ((window as any).L) {
                initMap();
            } else {
                const script = document.getElementById(scriptId);
                if (script) {
                    const oldOnload = script.onload;
                    script.onload = (ev) => {
                        if (oldOnload) (oldOnload as any)(ev);
                        initMap();
                    };
                }
            }
        }

        function initMap() {
            const L = (window as any).L;
            if (!L || !mapContainerRef.current || mapRef.current) return;

            const map = L.map(mapContainerRef.current).setView([storeLoc.lat, storeLoc.lng], 13);
            mapRef.current = map;

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            // Store Marker (Red)
            const storeIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            L.marker([storeLoc.lat, storeLoc.lng], { icon: storeIcon }).addTo(map).bindPopup("Shop (Pickup)");

            // Customer Marker (Green)
            const customerIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            L.marker([customerLoc.lat, customerLoc.lng], { icon: customerIcon }).addTo(map).bindPopup("Customer (Delivery)");

            // Partner Marker (Blue)
            if (partnerLoc) {
                const partnerIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
                L.marker([partnerLoc.lat, partnerLoc.lng], { icon: partnerIcon }).addTo(map).bindPopup("You");
            }

            // Fit bounds
            const bounds = L.latLngBounds([
                [storeLoc.lat, storeLoc.lng],
                [customerLoc.lat, customerLoc.lng]
            ]);
            if (partnerLoc) {
                bounds.extend([partnerLoc.lat, partnerLoc.lng]);
            }
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [storeLoc, customerLoc, partnerLoc]);

    return <div ref={mapContainerRef} className="h-64 w-full rounded-lg mt-4 border shadow-inner" style={{ minHeight: '250px' }} />;
}
