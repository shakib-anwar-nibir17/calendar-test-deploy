"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import Sidebar from "./sidebar/sidebar";
import { cn } from "@/lib/utils";

const MainLayout = ({ children }: { readonly children: React.ReactNode }) => {
  const { getOpenState, settings } = useSidebar();
  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          !settings.disabled && (!getOpenState ? "lg:ml-[90px]" : "lg:ml-72")
        )}
      >
        {children}
      </main>
    </>
  );
};

export default MainLayout;
