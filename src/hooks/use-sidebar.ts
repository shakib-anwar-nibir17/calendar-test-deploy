import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSidebarOpenState,
  setIsHover,
  setIsOpen,
  setSettings,
  toggleOpen,
} from "@/store/slices/sidebar.slice";
import { SidebarSettings } from "@/store/states/sidebar";

export const useSidebar = () => {
  const dispatch = useAppDispatch();

  return {
    isOpen: useAppSelector((state: RootState) => state.sidebar.isOpen),
    isHover: useAppSelector((state: RootState) => state.sidebar.isHover),
    settings: useAppSelector((state: RootState) => state.sidebar.settings),
    getOpenState: useAppSelector(selectSidebarOpenState), // Derived state
    toggleOpen: () => dispatch(toggleOpen()),
    setIsOpen: (isOpen: boolean) => dispatch(setIsOpen(isOpen)),
    setIsHover: (isHover: boolean) => dispatch(setIsHover(isHover)),
    setSettings: (settings: Partial<SidebarSettings>) =>
      dispatch(setSettings(settings)),
  };
};
