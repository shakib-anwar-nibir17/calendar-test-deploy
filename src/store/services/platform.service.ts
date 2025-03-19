import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const platformApi = createApi({
  reducerPath: "platformApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/platforms" }),
  tagTypes: ["Platforms"],

  endpoints: (builder) => ({
    getPlatforms: builder.query({
      query: () => "",
      providesTags: ["Platforms"],
    }),

    getPlatformById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Platforms", id }],
    }),

    createPlatform: builder.mutation({
      query: (newPlatform) => ({
        url: "",
        method: "POST",
        body: newPlatform,
      }),
      invalidatesTags: ["Platforms"],
    }),

    updatePlatform: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Platforms", id }],
    }),

    deletePlatform: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
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
