import React from "react";
import { UpcomingClasses } from "../dashboard/upcoming-classes";

import { RecentActivity } from "../dashboard/recent-activity";
import { DashboardHeader } from "../dashboard/dashboard-header";
import StatsPage from "../dashboard/stats";

const DashboardContainer = () => {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto space-y-6 mt-2">
        <StatsPage />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UpcomingClasses />
          <RecentActivity />
        </div>
      </div>
    </main>
  );
};

export default DashboardContainer;
