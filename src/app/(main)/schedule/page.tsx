import Calendar from "@/components/schedule/calendar";
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
      <main className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Event Calendar</h1>
        <Calendar />
      </main>
    </Suspense>
  );
}
