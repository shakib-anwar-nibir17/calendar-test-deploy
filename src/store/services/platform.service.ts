import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const platformApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }), // ✅ Works for both Pages & App Router
  endpoints: (builder) => ({
    getPlatforms: builder.query({
      query: () => "platforms", // Matches /api/platforms
    }),
    getPlatformById: builder.query({
      query: (id) => `platforms/${id}`, // Matches /api/platforms/[id]
    }),
    createPlatform: builder.mutation({
      query: (platform) => ({
        url: "platforms",
        method: "POST",
        body: platform,
      }),
    }),
    updatePlatform: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `platforms/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deletePlatform: builder.mutation({
      query: (id) => ({
        url: `platforms/${id}`,
        method: "DELETE",
      }),
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
