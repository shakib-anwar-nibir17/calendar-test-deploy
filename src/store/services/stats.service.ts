import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const statsApi = createApi({
  reducerPath: "statsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/stats" }),
  endpoints: (builder) => ({
    getGlobalStats: builder.query({
      query: ({ startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return `global?${params.toString()}`;
      },
    }),
    getPlatformStats: builder.query({
      query: ({ startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        return `platforms?${params.toString()}`;
      },
    }),
  }),
});

export const { useGetGlobalStatsQuery, useGetPlatformStatsQuery } = statsApi;
