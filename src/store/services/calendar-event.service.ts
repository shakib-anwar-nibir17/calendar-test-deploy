import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CalendarEvent, CalendarEventResponse } from "../states/calender";

export const calendarEventApi = createApi({
  reducerPath: "calendarEventApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }), // ✅ Matches Next.js API routes
  tagTypes: ["Events"], // ✅ Only keeps relevant tag

  endpoints: (builder) => ({
    getEvents: builder.query<CalendarEventResponse, void>({
      query: () => "/calendar-events", // ✅ Matches API structure
      providesTags: ["Events"],
    }),

    getEventById: builder.query({
      query: (id) => `/calendar-events/${id}`,
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),

    createEvent: builder.mutation<
      CalendarEventResponse,
      Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">
    >({
      query: (newEvent) => ({
        url: "/calendar-events",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["Events"],
    }),

    updateEvent: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/calendar-events/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Events", id }],
    }),

    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/calendar-events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Events", id }],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = calendarEventApi;
