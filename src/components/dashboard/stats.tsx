"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  CalendarIcon,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useGetGlobalStatsQuery,
  useGetPlatformStatsQuery,
} from "@/store/services/stats.service";

export default function StatsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [platforms, setPlatforms] = useState<string[]>([]);

  // Format dates for API queries
  const formattedStartDate = date?.from
    ? format(date.from, "yyyy-MM-dd")
    : undefined;
  const formattedEndDate = date?.to ? format(date.to, "yyyy-MM-dd") : undefined;

  // Use RTK Query hooks
  const {
    data: globalStats,
    isLoading: isLoadingGlobal,
    error: globalError,
  } = useGetGlobalStatsQuery({
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  });

  const {
    data: platformStats,
    isLoading: isLoadingPlatforms,
    error: platformsError,
  } = useGetPlatformStatsQuery({
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  });

  // Extract platform names from platform stats
  if (
    platformStats &&
    Object.keys(platformStats).length > 0 &&
    platforms.length === 0
  ) {
    setPlatforms(Object.keys(platformStats));
  }

  // Default values for when data is loading
  const defaultGlobalStats = {
    totalEarnings: 0,
    totalHours: 0,
    totalClasses: 0,
    upcomingClasses: 0,
    completedClasses: 0,
  };

  // Calculate stats based on selected platform
  let platformSpecificStats = platformStats?.[selectedPlatform];
  if (platformSpecificStats) {
    platformSpecificStats = {
      ...platformSpecificStats,
      totalEarnings: 0, // Platform API doesn't provide earnings
    };
  }

  const displayStats =
    selectedPlatform === "all"
      ? globalStats || defaultGlobalStats
      : platformSpecificStats || defaultGlobalStats;

  // Loading state
  const isLoading = isLoadingGlobal || isLoadingPlatforms;

  // Error state
  const hasError = globalError || platformsError;
  const errorMessage = hasError
    ? "Failed to load statistics. Please try again later."
    : null;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Teaching Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <h2 className="text-sm font-medium mb-2">Date Range</h2>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {(() => {
                    if (date?.from) {
                      if (date.to) {
                        return (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        );
                      }
                      return format(date.from, "LLL dd, y");
                    }
                    return <span>Pick a date</span>;
                  })()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-sm font-medium mb-2">Platform</h2>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading statistics...</span>
        </div>
      )}

      {!isLoading && !hasError && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Platform Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Earnings
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    $
                    {selectedPlatform === "all"
                      ? displayStats.totalEarnings.toFixed(2)
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For selected period
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Hours
                  </CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {displayStats.totalHours}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hours of teaching
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Classes
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {displayStats.totalClasses}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Classes in period
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion Rate
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {displayStats.totalClasses > 0
                      ? Math.round(
                          (displayStats.completedClasses /
                            displayStats.totalClasses) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="inline-block w-3 h-3 mr-1 rounded-full bg-green-500"></span>
                    <span className="mr-2">
                      {displayStats.completedClasses} completed
                    </span>
                    <span className="inline-block w-3 h-3 mr-1 rounded-full bg-blue-500"></span>
                    <span>{displayStats.upcomingClasses} upcoming</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${
                          displayStats.totalClasses > 0
                            ? Math.round(
                                (displayStats.completedClasses /
                                  displayStats.totalClasses) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {platformStats &&
                Object.entries(platformStats).map(
                  ([platform, stats], index) => {
                    // Rotate through different colors for each platform
                    const colors = [
                      {
                        border: "border-blue-500",
                        text: "text-blue-600",
                        bg: "bg-blue-500",
                      },
                      {
                        border: "border-purple-500",
                        text: "text-purple-600",
                        bg: "bg-purple-500",
                      },
                      {
                        border: "border-green-500",
                        text: "text-green-600",
                        bg: "bg-green-500",
                      },
                      {
                        border: "border-amber-500",
                        text: "text-amber-600",
                        bg: "bg-amber-500",
                      },
                      {
                        border: "border-rose-500",
                        text: "text-rose-600",
                        bg: "bg-rose-500",
                      },
                      {
                        border: "border-cyan-500",
                        text: "text-cyan-600",
                        bg: "bg-cyan-500",
                      },
                    ];
                    const colorIndex = index % colors.length;
                    const color = colors[colorIndex];

                    const completionRate =
                      (
                        stats as {
                          totalClasses: number;
                          completedClasses: number;
                        }
                      ).totalClasses > 0
                        ? Math.round(
                            (
                              stats as {
                                totalClasses: number;
                                completedClasses: number;
                              }
                            ).completedClasses /
                              (
                                stats as {
                                  totalClasses: number;
                                  completedClasses: number;
                                }
                              ).totalClasses
                          ) * 100
                        : 0;

                    return (
                      <Card
                        key={platform}
                        className={`border-l-4 ${color.border}`}
                      >
                        <CardHeader>
                          <CardTitle className={color.text}>
                            <div className="flex items-center">
                              <BarChart3
                                className={`h-5 w-5 mr-2 ${color.text}`}
                              />
                              {platform}
                            </div>
                          </CardTitle>
                          <CardDescription>Platform statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-4">
                            <div>
                              <dt className="text-sm font-medium">
                                Total Classes
                              </dt>
                              <dd className="text-2xl font-bold">
                                {
                                  (stats as { totalClasses: number })
                                    .totalClasses
                                }
                              </dd>
                              <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full ${color.bg} rounded-full`}
                                  style={{
                                    width: `${Math.min(
                                      (stats as { totalClasses: number })
                                        .totalClasses * 5,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <dt className="text-sm font-medium">
                                Total Hours
                              </dt>
                              <dd className="text-2xl font-bold">
                                {(stats as { totalHours: number }).totalHours}
                              </dd>
                              <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full ${color.bg} rounded-full`}
                                  style={{
                                    width: `${Math.min(
                                      (stats as { totalHours: number })
                                        .totalHours * 2.5,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <dt className="text-sm font-medium">
                                Completion Rate
                              </dt>
                              <dd className="text-2xl font-bold">
                                {completionRate}%
                              </dd>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <span
                                  className={`inline-block w-2 h-2 mr-1 rounded-full bg-green-500`}
                                ></span>
                                <span className="mr-2">
                                  {
                                    (stats as { completedClasses: number })
                                      .completedClasses
                                  }{" "}
                                  completed
                                </span>
                                <span
                                  className={`inline-block w-2 h-2 mr-1 rounded-full bg-blue-500`}
                                ></span>
                                <span>
                                  {
                                    (stats as { upcomingClasses: number })
                                      .upcomingClasses
                                  }{" "}
                                  upcoming
                                </span>
                              </div>
                              <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full ${color.bg} rounded-full`}
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </dl>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
