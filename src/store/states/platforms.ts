import { CalendarEvent } from "./calender";

type paymentType = "Weekly" | "Bi-Weekly" | "Monthly" | "Upfront";

export type DayValue =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type Platform = {
  id: string;
  name: string;
  paymentType: paymentType;
  hourlyRate: number;
  nextPayDate?: string;
  day?: DayValue;
  events?: CalendarEvent[];
};

export type PlatformsState = {
  platforms: Platform[];
};

export interface PlatformResponse {
  success: boolean;
  code: number;
  data: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}
