import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const platformApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Platforms"],

  endpoints: (builder) => ({
    getPlatforms: builder.query({
      query: () => "/platforms",
      providesTags: ["Platforms"],
    }),

    getPlatformById: builder.query({
      query: (id) => `/platforms/${id}`,
      providesTags: (result, error, id) => [{ type: "Platforms", id }],
    }),

    createPlatform: builder.mutation({
      query: (newPlatform) => ({
        url: "/platforms",
        method: "POST",
        body: newPlatform,
      }),
      invalidatesTags: ["Platforms"],
    }),

    updatePlatform: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/platforms/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Platforms", id }],
    }),

    deletePlatform: builder.mutation({
      query: (id) => ({
        url: `/platforms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Platforms"],
    }),
  }),
});

export const {
  useGetPlatformsQuery,
  useGetPlatformByIdQuery,
  useCreatePlatformMutation,
  useUpdatePlatformMutation,
  useDeletePlatformMutation,
} = platformApi;
