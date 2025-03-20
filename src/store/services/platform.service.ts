import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform, PlatformResponse } from "../states/platforms";

export const platformApi = createApi({
  reducerPath: "platformApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/platforms" }),
  tagTypes: ["Platforms"],

  endpoints: (builder) => ({
    // Fetch all platforms
    getPlatforms: builder.query({
      query: () => "",
      providesTags: ["Platforms"],
      transformResponse: (response) => {
        console.log("Fetched platforms:", response);
        return response;
      },
    }),

    // Fetch a single platform by ID
    getPlatformById: builder.query({
      query: (id) => `${id}`,
      providesTags: (result, error, id) => [{ type: "Platforms", id }],
    }),

    // Create a new platform
    createPlatform: builder.mutation<PlatformResponse, Omit<Platform, "id">>({
      query: (newPlatform) => ({
        url: "",
        method: "POST",
        body: JSON.stringify(newPlatform),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Platforms"],
    }),

    // Update an existing platform
    updatePlatform: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `${id}`,
        method: "PUT",
        body: JSON.stringify(updates),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Platforms", id }],
    }),

    // Delete a platform
    deletePlatform: builder.mutation({
      query: (id) => ({
        url: `${id}`,
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
