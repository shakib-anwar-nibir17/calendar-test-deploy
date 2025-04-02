import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebar.slice";
import { timeZoneApi } from "./services/time-zone.service";
import { platformApi } from "./services/platform.service";
import { eventsApi as calendarEventApi } from "./services/calendar-event.service";
import { statsApi } from "./services/stats.service";

export const makeStore = () => {
  return configureStore({
    reducer: {
      sidebar: sidebarReducer,
      [timeZoneApi.reducerPath]: timeZoneApi.reducer,
      [platformApi.reducerPath]: platformApi.reducer,
      [calendarEventApi.reducerPath]: calendarEventApi.reducer,
      [statsApi.reducerPath]: statsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        timeZoneApi.middleware,
        platformApi.middleware,
        calendarEventApi.middleware,
        statsApi.middleware
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
