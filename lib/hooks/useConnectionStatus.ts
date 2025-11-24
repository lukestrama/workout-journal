import { useEffect, useState } from "react";

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }

      try {
        await fetch("/api/ping", { cache: "no-store" });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    checkConnection();

    const interval = setInterval(checkConnection, 10000);

    window.addEventListener("online", checkConnection);
    window.addEventListener("offline", checkConnection);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", checkConnection);
      window.removeEventListener("offline", checkConnection);
    };
  }, []);

  return { isOnline };
}
