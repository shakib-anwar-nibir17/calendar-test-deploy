"use client";

import { useState } from "react";
import { PlatformsHeader } from "../platform/platforms-header";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { PlatformsTable } from "../platform/platforms-table";
import { AddPlatformModal } from "../platform/add-platform-modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { updatePlatform } from "@/store/slices/platform.slice";
import { Platform } from "@/store/states/platforms";

const PlatformContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const platforms = useAppSelector(
    (state: RootState) => state.platforms.platforms
  );

  const handleEditPlatform = (platform: Platform) => {
    dispatch(updatePlatform(platform));
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <PlatformsHeader />
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Platform
            </Button>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <PlatformsTable
              onEditPlatform={handleEditPlatform}
              platforms={platforms}
            />
          </div>
        </main>
      </div>
      <AddPlatformModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PlatformContainer;
