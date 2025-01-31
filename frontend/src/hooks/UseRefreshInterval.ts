import { useEffect, useState } from "react";

export default function useRefreshInterval(intervalMs: number = 1000): number {
    const [ticks, setTicks] = useState<number>(0);
    const safeInterval = Math.max(5, intervalMs);

    useEffect(() => {
        const interval = setInterval(() => {
            setTicks(ticks + 1);
        }, safeInterval);
        return () => clearInterval(interval);
    }, [ticks, safeInterval]);

    return ticks;
}