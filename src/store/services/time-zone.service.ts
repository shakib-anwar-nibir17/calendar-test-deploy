import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TimeZoneApiResponse } from "../states/time-api";

export const timeZoneApi = createApi({
  reducerPath: "timeZoneApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://timeapi.io/api/time" }),
  endpoints: (builder) => ({
    fetchTimeForZone: builder.query<TimeZoneApiResponse, string>({
      query: (timezone) =>
        `/current/zone?timeZone=${encodeURIComponent(timezone)}`,
      transformResponse: (response: TimeZoneApiResponse) => response,
    }),
  }),
});

export const { useFetchTimeForZoneQuery } = timeZoneApi;
