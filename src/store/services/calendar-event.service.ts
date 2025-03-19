import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const calendarEventApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Platforms", "Events"],

  endpoints: (builder) => ({
    getEvents: builder.query({
      query: () => "/events",
      providesTags: ["Events"],
    }),

    getEventById: builder.query({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),

    createEvent: builder.mutation({
      query: (newEvent) => ({
        url: "/events",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["Events"],
    }),

    updateEvent: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Events", id }],
    }),

    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
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
