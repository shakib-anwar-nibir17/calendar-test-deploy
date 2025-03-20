import mongoose, { Schema, Document, model } from "mongoose";
import { CalendarEvent } from "./calendar-event.model";

export interface PlatformDocument extends Document {
  name: string;
  paymentType: "Weekly" | "Bi-Weekly" | "Monthly" | "Upfront";
  hourlyRate: number;
  nextPayDate?: string;
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

const platformSchema = new Schema<PlatformDocument>(
  {
    name: { type: String, required: true, unique: true },
    paymentType: {
      type: String,
      enum: ["Weekly", "Bi-Weekly", "Monthly", "Upfront"],
      required: true,
    },
    hourlyRate: { type: Number, required: true },
    nextPayDate: { type: String },
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
  },
  { timestamps: true }
);

const Platform =
  mongoose.models.Platform ||
  model<PlatformDocument>("Platform", platformSchema);

export default Platform;
