import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebar.slice";
import platformReducer from "./slices/platform.slice";
import { timeZoneApi } from "./services/time-zone.service";
import { platformApi } from "./services/platform.service";
import { calendarEventApi } from "./services/calendar-event.service";

export const makeStore = () => {
  return configureStore({
    reducer: {
      sidebar: sidebarReducer,
      platforms: platformReducer,
      [timeZoneApi.reducerPath]: timeZoneApi.reducer,
      [platformApi.reducerPath]: platformApi.reducer,
      [calendarEventApi.reducerPath]: calendarEventApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        timeZoneApi.middleware,
        platformApi.middleware,
        calendarEventApi.middleware
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
