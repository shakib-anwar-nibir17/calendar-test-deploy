// Sidebar settings type
export type SidebarSettings = {
  disabled: boolean;
  isHoverOpen: boolean;
};

// Sidebar state type
export type SidebarState = {
  isOpen: boolean;
  isHover: boolean;
  settings: SidebarSettings;
};
