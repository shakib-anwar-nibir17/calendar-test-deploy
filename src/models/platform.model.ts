import { Schema, Document, model } from "mongoose";
import { CalendarEvent } from "./calendarEvent.model";

export interface PlatformDocument extends Document {
  name: string;
  paymentType: "Weekly" | "Bi-Weekly" | "Monthly" | "Upfront";
  hourlyRate: number;
  nextPayDate: Date;
  day?:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  events: CalendarEvent[];
}

const platformSchema = new Schema<PlatformDocument>({
  name: { type: String, required: true },
  paymentType: {
    type: String,
    enum: ["Weekly", "Bi-Weekly", "Monthly", "Upfront"],
    required: true,
  },
  hourlyRate: { type: Number, required: true },
  nextPayDate: { type: Date, required: true },
  day: {
    type: String,
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
  },
  events: [{ type: Schema.Types.ObjectId, ref: "CalendarEvent" }],
});

const Platform = model<PlatformDocument>("Platform", platformSchema);

export default Platform;
