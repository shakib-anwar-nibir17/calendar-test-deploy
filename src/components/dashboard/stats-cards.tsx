import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Layers,
  GraduationCapIcon as Graduation,
  CheckCircle,
  Clock,
} from "lucide-react";

export const StatsCards = () => {
  // This would typically come from an API or database
  const stats = {
    totalPlatforms: 0,
    totalClasses: 0,
    completedClasses: 0,
    upcomingClasses: 0,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stats Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <StatItem
          icon={<Layers className="h-5 w-5" />}
          label="Total Platforms"
          value={stats.totalPlatforms}
          color="blue"
        />
        <StatItem
          icon={<Graduation className="h-5 w-5" />}
          label="Total Classes"
          value={stats.totalClasses}
          color="purple"
        />
        <StatItem
          icon={<CheckCircle className="h-5 w-5" />}
          label="Completed"
          value={stats.completedClasses}
          color="green"
        />
        <StatItem
          icon={<Clock className="h-5 w-5" />}
          label="Upcoming"
          value={stats.upcomingClasses}
          color="amber"
        />
      </CardContent>
    </Card>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "purple" | "green" | "amber";
}

type ReadonlyStatItemProps = Readonly<StatItemProps>;

const StatItem = ({ icon, label, value, color }: ReadonlyStatItemProps) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    green: "bg-green-500/10 text-green-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-md ${colorClasses[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
};
