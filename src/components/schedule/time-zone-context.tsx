"use client";

import { useFetchTimeForZoneQuery } from "@/store/services/time-zone.service";
import { TimeZoneApiResponse } from "@/store/states/time-api";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

interface TimeZoneContextType {
  currentTimeZone: string;
  setCurrentTimeZone: (timezone: string) => void;
  timeData: TimeZoneApiResponse;
  loading: boolean;
}

const TimeZoneContext = createContext<TimeZoneContextType | undefined>(
  undefined
);

export const useTimeZone = () => {
  const context = useContext(TimeZoneContext);
  if (context === undefined) {
    throw new Error("useTimeZone must be used within a TimeZoneProvider");
  }
  return context;
};

interface TimeZoneProviderProps {
  children: ReactNode;
}

const timeZone2 = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const TimeZoneProvider = ({ children }: TimeZoneProviderProps) => {
  const [currentTimeZone, setCurrentTimeZone] = useState<string>(timeZone2);

  const {
    data: currentTime,
    isFetching: loading,
    error,
  } = useFetchTimeForZoneQuery(currentTimeZone);

  console.log(currentTime);

  if (error) console.log(error);

  const value = useMemo(
    () => ({
      currentTimeZone,
      setCurrentTimeZone,
      timeData: currentTime ?? ({} as TimeZoneApiResponse),
      loading,
    }),
    [currentTimeZone, setCurrentTimeZone, currentTime, loading]
  );

  return (
    <TimeZoneContext.Provider value={value}>
      {children}
    </TimeZoneContext.Provider>
  );
};
