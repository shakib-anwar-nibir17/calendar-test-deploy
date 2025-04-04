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
  isRecurring?: boolean;
  recurrencePattern?: "weekly" | "bi-weekly";
  parentEventId?: string;
}

const calendarEventSchema = new Schema<CalendarEvent>(
  {
    platform: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    backgroundColor: { type: String, default: "#3788d8" }, // Default to white
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
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: {
      type: String,
      enum: ["weekly", "bi-weekly"],
      required: function () {
        return this.isRecurring === true;
      },
    },
    parentEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CalendarEvent",
    },
  },
  { timestamps: true } // This auto-generates createdAt and updatedAt
);

calendarEventSchema.pre("save", function (next) {
  if (!this.start) {
    console.warn(
      `⚠️ Skipping event validation: Missing start time for ${this._id}`
    );
    return next();
  }

  if (this.hoursEngaged == null || this.hoursEngaged <= 0) {
    console.warn(
      `⚠️ Skipping end time calculation: Invalid hoursEngaged (${this.hoursEngaged}) for ${this._id}`
    );
    return next();
  }

  const startDate = new Date(this.start);

  // Only set `end` if it's missing or incorrectly set
  if (!this.end || new Date(this.end) <= startDate) {
    this.end = new Date(
      startDate.getTime() + this.hoursEngaged * 60 * 60 * 1000
    );
    console.log(`✅ Updated end time for event ${this._id}: ${this.end}`);
  }

  next();
});

const CalendarEventModel =
  mongoose.models.CalendarEvent ||
  model<CalendarEvent>("CalendarEvent", calendarEventSchema);

export default CalendarEventModel;
