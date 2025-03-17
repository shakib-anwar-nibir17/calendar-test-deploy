import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { SidebarSettings, SidebarState } from "../states/sidebar";

// Initial state
const initialState: SidebarState = {
  isOpen: true,
  isHover: false,
  settings: { disabled: false, isHoverOpen: false },
};

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleOpen: (state) => {
      state.isOpen = !state.isOpen;
    },
    setIsOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setIsHover: (state, action: PayloadAction<boolean>) => {
      state.isHover = action.payload;
    },
    setSettings: (state, action: PayloadAction<Partial<SidebarSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

// Export actions
export const { toggleOpen, setIsOpen, setIsHover, setSettings } =
  sidebarSlice.actions;

// Selector to compute `getOpenState` equivalent
export const selectSidebarOpenState = (state: RootState) =>
  state.sidebar.isOpen ||
  (state.sidebar.settings.isHoverOpen && state.sidebar.isHover);

// Export reducer
export default sidebarSlice.reducer;
