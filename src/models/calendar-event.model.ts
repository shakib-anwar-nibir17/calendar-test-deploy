import mongoose, { Schema, Document, model } from "mongoose";

export interface CalendarEvent extends Document {
  platform: string; // Assuming Platform["name"] resolves to a string
  start: Date;
  end: Date;
  backgroundColor?: string;
  displayStart?: Date;
  displayEnd?: Date;
  hoursEngaged?: number;
  status: "active" | "completed" | "create";
  allday: boolean;
  timeZone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const calendarEventSchema = new Schema<CalendarEvent>(
  {
    platform: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    backgroundColor: { type: String, default: "#ffffff" }, // Default to white
    displayStart: { type: Date },
    displayEnd: { type: Date },
    hoursEngaged: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed", "create"],
      default: "create",
    },
    allday: { type: Boolean, default: false },
    timeZone: { type: String, default: "UTC" }, // Default to UTC timezone
  },
  { timestamps: true } // This auto-generates createdAt and updatedAt
);

const CalendarEventModel =
  mongoose.models.CalendarEvent ||
  model<CalendarEvent>("CalendarEvent", calendarEventSchema);

export default CalendarEventModel;
