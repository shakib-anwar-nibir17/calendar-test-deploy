"use client";

import { TIME_API_CONFIG } from "@/lib/config/timeApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useTimeApiSync(onSync: () => Promise<void>) {
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Function to perform the sync
  const performSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      await onSync();
      setLastSynced(new Date());
    } catch (error) {
      console.error("Time API sync failed:", error);
      toast.error("Time API sync failed. Please try again later.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial sync on component mount
  useEffect(() => {
    performSync();
  }, []);

  // Set up interval for periodic syncing
  useEffect(() => {
    const interval = setInterval(() => {
      performSync();
    }, TIME_API_CONFIG.syncInterval);

    return () => clearInterval(interval);
  }, []);

  return {
    lastSynced,
    isSyncing,
    manualSync: performSync,
  };
}
