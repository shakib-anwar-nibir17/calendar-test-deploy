import { CalendarEvent } from "@/store/states/calender";
import { Platform } from "@/store/states/platforms";

export const mockPlatforms: Platform[] = [
  {
    id: "1",
    name: "Upwork",
    paymentType: "Monthly",
    hourlyRate: 25,
    nextPayData: "2025-03-20T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Fiverr",
    paymentType: "Weekly",
    hourlyRate: 0,
    nextPayData: "2025-03-18T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Freelancer",
    paymentType: "Upfront",
    hourlyRate: 30,
    nextPayData: "2025-03-25T00:00:00.000Z",
  },
];

export const mockCalendarEvents: CalendarEvent[] = [];
