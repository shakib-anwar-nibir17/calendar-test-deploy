"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import { getTimeZones } from "@/lib/services/timeApi";

interface TimeZoneContextType {
  currentTimeZone: string;
  availableTimeZones: string[];
  setCurrentTimeZone: (timeZone: string) => void;
  isLoading: boolean;
}

const TimeZoneContext = createContext<TimeZoneContextType | undefined>(
  undefined
);

export function TimeZoneProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [currentTimeZone, setCurrentTimeZone] = useState<string>("UTC");
  const [availableTimeZones, setAvailableTimeZones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Try to get the user's time zone from the browser
  useEffect(() => {
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTimeZone) {
        setCurrentTimeZone(userTimeZone);
      }
    } catch (error) {
      console.error("Failed to get user time zone:", error);
    }
  }, []);

  // Fetch available time zones
  useEffect(() => {
    async function fetchTimeZones() {
      try {
        setIsLoading(true);
        const timeZones = await getTimeZones();
        setAvailableTimeZones(timeZones);
      } catch (error) {
        console.error("Failed to fetch time zones:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimeZones();
  }, []);

  const timeZoneContextValue = useMemo(
    () => ({
      currentTimeZone,
      availableTimeZones,
      setCurrentTimeZone,
      isLoading,
    }),
    [currentTimeZone, availableTimeZones, setCurrentTimeZone, isLoading]
  );

  return (
    <TimeZoneContext.Provider value={timeZoneContextValue}>
      {children}
    </TimeZoneContext.Provider>
  );
}

export function useTimeZone() {
  const context = useContext(TimeZoneContext);
  if (context === undefined) {
    throw new Error("useTimeZone must be used within a TimeZoneProvider");
  }
  return context;
}
