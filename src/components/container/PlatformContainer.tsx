"use client";

import { useState } from "react";
import { PlatformsHeader } from "../platform/platforms-header";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { PlatformsTable } from "../platform/platforms-table";
import { AddPlatformModal } from "../platform/add-platform-modal";

import { Platform } from "@/store/states/platforms";
import { UpdatePlatformModal } from "../platform/update-platform-modal";

import {
  useDeletePlatformMutation,
  useGetPlatformsQuery,
} from "@/store/services/platform.service";
import { toast } from "sonner";

const PlatformContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [editPlatform, setEditPlatform] = useState<Platform | null>(null);

  const { data: allPlatforms } = useGetPlatformsQuery();
  const [deletePlatform] = useDeletePlatformMutation();

  const handleEditPlatform = (id: string) => {
    if (!allPlatforms?.data) return;
    const platform = allPlatforms.data?.find((p) => p._id === id);
    setEditPlatform(platform ?? null);
    setIsEditModal(!isEditModal);
  };

  const handleDeletePlatform = async (platformId: string) => {
    const response = await deletePlatform(platformId);
    if (response.data?.success === true) {
      toast.success("Platform deleted successfully.");
    } else {
      toast.error("Failed to delete platform.");
    }
  };

  console.log("all platforms", editPlatform);

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
            {allPlatforms && (
              <PlatformsTable
                platforms={allPlatforms.data}
                onEditPlatform={handleEditPlatform}
                onDeletePlatform={handleDeletePlatform}
              />
            )}
          </div>
        </main>
      </div>
      <AddPlatformModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <UpdatePlatformModal
        isOpen={isEditModal}
        onClose={() => setIsEditModal(false)}
        platform={editPlatform}
      />
    </div>
  );
};

export default PlatformContainer;
