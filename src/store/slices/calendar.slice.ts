import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalendarEvent } from "../states/calender";
import { mockCalendarEvents } from "@/utils/mock-data";
// Import initial events

// Load events from localStorage or use the predefined events

const initialState: CalendarEvent[] = mockCalendarEvents;

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<Omit<CalendarEvent, "id">>) => {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        ...action.payload,
      };
      console.log(newEvent);
      state.push(newEvent);
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      const updatedEvents = state.filter(
        (event) => event.id !== action.payload
      );

      return updatedEvents;
    },
    setEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      return action.payload;
    },
  },
});

export const { addEvent, removeEvent, setEvents } = calendarSlice.actions;
export default calendarSlice.reducer;

// // Selector
// export const selectEvents = (state: RootState) => state.;
