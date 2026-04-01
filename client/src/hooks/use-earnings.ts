import { useState, useEffect } from "react";
import { getEarnings } from "@/lib/firestore";
import type { Earnings } from "@shared/schema";

export function useEarnings(partnerId?: string) {
    const [todayEarnings, setTodayEarnings] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchTodayEarnings = async () => {
        if (!partnerId) return;

        setLoading(true);
        try {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const earnings = await getEarnings(partnerId, startOfToday);
            const total = earnings.reduce((sum, e) => sum + e.amount, 0);
            setTodayEarnings(total);
        } catch (error) {
            console.error("Error fetching today's earnings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayEarnings();

        // Refresh earnings every 5 minutes or when partnerId changes
        const interval = setInterval(fetchTodayEarnings, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [partnerId]);

    return { todayEarnings, loading, refresh: fetchTodayEarnings };
}
