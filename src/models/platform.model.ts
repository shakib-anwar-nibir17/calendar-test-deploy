import mongoose, { Schema, Document, model } from "mongoose";
import CalendarEventModel, { CalendarEvent } from "./calendar-event.model"; // Ensure CalendarEventModel is imported

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

if (!mongoose.models.CalendarEvent) {
  mongoose.model("CalendarEvent", CalendarEventModel.schema);
}

// Define Platform schema
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
    events: [{ type: Schema.Types.ObjectId, ref: "CalendarEvent" }], // Ensure this model is registered
  },
  { timestamps: true }
);

// Ensure the model is registered only once
const Platform =
  mongoose.models.Platform ||
  model<PlatformDocument>("Platform", platformSchema);

export default Platform;
