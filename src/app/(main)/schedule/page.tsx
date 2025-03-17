import ScheduleContainer from "@/components/container/ScheduleContainer";
import { LucideLoader } from "lucide-react";
import { Suspense } from "react";

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <LucideLoader className="animate-spin" />
        </div>
      }
    >
      <ScheduleContainer />
    </Suspense>
  );
}
