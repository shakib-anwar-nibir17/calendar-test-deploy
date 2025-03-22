"use client";

import { fetchTimeApiEvents } from "@/lib/services/timeApi";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CalendarEvent as Event } from "../states/calender";

export const eventsApi = createApi({
  reducerPath: "eventsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Events"],

  endpoints: (builder) => ({
    getEvents: builder.query<{ events: Event[] }, void>({
      queryFn: async () => {
        try {
          const response = await fetch("/api/events");
          if (!response.ok) {
            throw new Error("Failed to fetch database events");
          }
          const dbEvents: Event[] = await response.json();

          const timeApiEvents = await fetchTimeApiEvents();
          const allEvents = [...dbEvents, ...timeApiEvents];

          return { data: { events: allEvents } };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Events"],
    }),

    getEventById: builder.query<Event, string>({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),

    createEvent: builder.mutation<Event, Omit<Event, "id">>({
      query: (newEvent) => ({
        url: "/events",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["Events"],
    }),

    updateEvent: builder.mutation<Event, Partial<Event> & { id: string }>({
      query: ({ id, ...updates }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Events", id }],
    }),

    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/events/${id}`,
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
} = eventsApi;
