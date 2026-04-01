import { useState, useEffect } from "react";

export interface Location {
    lat: number;
    lng: number;
}

export function useLocation() {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
        };

        const handleError = (error: GeolocationPositionError) => {
            setError(error.message);
        };

        // Get initial location
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);

        // Watch for location changes
        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return { location, error };
}
