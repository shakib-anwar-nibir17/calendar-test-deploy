import React from "react";
import { DashboardHeader } from "../dashboard/dashboard-header";
import StatsPage from "../dashboard/stats";

const DashboardContainer = () => {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto space-y-6 mt-2">
        <StatsPage />
      </div>
    </main>
  );
};

export default DashboardContainer;
