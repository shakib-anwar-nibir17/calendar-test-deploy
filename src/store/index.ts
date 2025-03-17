import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebar.slice";
import platformReducer from "./slices/platform.slice";
import { timeZoneApi } from "./services/time-zone.service";

export const makeStore = () => {
  return configureStore({
    reducer: {
      sidebar: sidebarReducer,
      platforms: platformReducer,
      [timeZoneApi.reducerPath]: timeZoneApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(timeZoneApi.middleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
