import { useState, useEffect } from "react";
import type { OnlineStatus } from "../types";

export const useOnlineStatus = (): OnlineStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);

      setTimeout(() => {
        if (navigator.onLine) {
          setShowOfflineMessage(false);
        }
      }, 3000);
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "online") {
        handleOnline();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      }
    };
  }, []);

  return { isOnline, showOfflineMessage };
};
