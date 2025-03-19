import { Schema, Document, model } from "mongoose";

export interface CalendarEvent extends Document {
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  description?: string;
}

const calendarEventSchema = new Schema<CalendarEvent>({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  allDay: { type: Boolean, default: false },
  description: { type: String },
});

const CalendarEventModel = model<CalendarEvent>(
  "CalendarEvent",
  calendarEventSchema
);

export default CalendarEventModel;
