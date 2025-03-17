import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Platform, PlatformsState } from "../states/platforms";
import { mockPlatforms } from "@/utils/mock-data";

const initialState: PlatformsState = {
  platforms: mockPlatforms,
};

const platformSlice = createSlice({
  name: "platforms",
  initialState,
  reducers: {
    addPlatform: (state, action: PayloadAction<Omit<Platform, "id">>) => {
      const newPlatform: Platform = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.platforms.push(newPlatform);
    },
    updatePlatform: (state, action: PayloadAction<Platform>) => {
      const index = state.platforms.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.platforms[index] = action.payload;
      }
    },
    deletePlatform: (state, action: PayloadAction<string>) => {
      state.platforms = state.platforms.filter((p) => p.id !== action.payload);
    },
  },
});

export const { addPlatform, updatePlatform, deletePlatform } =
  platformSlice.actions;
export default platformSlice.reducer;
