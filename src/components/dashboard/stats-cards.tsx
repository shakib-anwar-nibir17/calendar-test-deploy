"use client";

import { useState } from "react";
import {
  Database,
  GraduationCap,
  CheckCircle,
  Clock,
  Calendar,
  Coins,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { extractPlatformStatistics } from "@/utils/platform-statistics";
import { useAppSelector } from "@/store/hooks";
import { getFromLocalStorage } from "@/utils/local-storage";
import { CalendarEvent } from "@/store/states/calender";

// Mock data for platforms

export default function StatsCards() {
  const platforms = useAppSelector((state) => state.platforms.platforms);
  const events = getFromLocalStorage<CalendarEvent[]>("calendarEvents") || [];
  const stats = extractPlatformStatistics(events, platforms);

  console.log(stats);

  const [selectedView, setSelectedView] = useState("overview");

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Stats Overview</CardTitle>
        <CardDescription>
          View your learning platforms statistics and details
        </CardDescription>
        <Tabs
          defaultValue="overview"
          onValueChange={setSelectedView}
          className="mt-2"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {selectedView === "overview" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Total Platforms
                </span>
              </div>
              <span className="text-3xl font-bold">
                {stats.platforms.length}
              </span>
            </div>

            <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900">
                  <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Total Classes
                </span>
              </div>
              <span className="text-3xl font-bold">
                {stats.total.totalClasses}
              </span>
            </div>

            <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <span className="text-3xl font-bold">
                {stats.total.completedClasses}
              </span>
            </div>

            <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm text-muted-foreground">Upcoming</span>
              </div>
              <span className="text-3xl font-bold">
                {stats.total.upcomingClasses}
              </span>
            </div>

            <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-600" />
                </div>
                <span className="text-sm text-muted-foreground">Earning</span>
              </div>
              <span className="text-3xl font-bold">
                {stats.total.moneyEarned}
              </span>
            </div>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {stats.platforms.map((platform) => (
              <AccordionItem key={platform.name} value={platform.name}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    {/* <div className="flex items-center gap-2 mr-4">
                      <span className="text-sm text-muted-foreground">
                        {platform.progress}% Complete
                      </span>
                    </div> */}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-11 pr-4 pb-2">
                    {/* <Progress value={platform.progress} className="h-2 mb-4" /> */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Classes
                          </span>
                          <span className="font-medium">
                            {platform.totalClasses}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Completed
                          </span>
                          <span className="font-medium">
                            {platform.completedClasses}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Upcoming
                          </span>
                          <span className="font-medium">
                            {platform.upcomingClasses}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Students
                          </span>
                          <span className="font-medium">
                            {platform.students}
                          </span>
                        </div>
                      </div> */}

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Next Class
                          </span>
                          <span className="font-medium">
                            {(platform.nextClass &&
                              new Date(platform.nextClass).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )) ||
                              "No next class scheduled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
