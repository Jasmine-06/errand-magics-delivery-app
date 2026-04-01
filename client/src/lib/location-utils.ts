export interface Location {
    lat: number;
    lng: number;
}

/**
 * Calculates the distance between two points in kilometers using the Haversine formula.
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Suggests a delivery fee based on total distance.
 * Logic: ₹20 base fee + ₹10 per km
 */
export function calculateSuggestedFee(totalDistance: number): number {
    const baseFee = 20;
    const perKmRate = 12;
    return Math.round(baseFee + totalDistance * perKmRate);
}
