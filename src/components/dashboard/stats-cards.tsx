"use client";

import { useState } from "react";
import {
  Database,
  GraduationCap,
  CheckCircle,
  Clock,
  Users,
  Calendar,
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for platforms
const platformsData = [
  {
    id: "platform-1",
    name: "Learning Platform Alpha",
    classes: 12,
    completed: 5,
    upcoming: 3,
    progress: 42,
    students: 156,
    nextClass: "2023-05-15T10:00:00",
  },
  {
    id: "platform-2",
    name: "Education Hub Beta",
    classes: 8,
    completed: 2,
    upcoming: 4,
    progress: 25,
    students: 89,
    nextClass: "2023-05-12T14:30:00",
  },
  {
    id: "platform-3",
    name: "Training Center Gamma",
    classes: 15,
    completed: 8,
    upcoming: 2,
    progress: 53,
    students: 210,
    nextClass: "2023-05-11T09:15:00",
  },
];

export default function StatsCards() {
  const [selectedView, setSelectedView] = useState("platform");

  // Calculate totals
  const totalPlatforms = platformsData.length;
  const totalClasses = platformsData.reduce(
    (sum, platform) => sum + platform.classes,
    0
  );
  const totalCompleted = platformsData.reduce(
    (sum, platform) => sum + platform.completed,
    0
  );
  const totalUpcoming = platformsData.reduce(
    (sum, platform) => sum + platform.upcoming,
    0
  );

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
              <span className="text-3xl font-bold">{totalPlatforms}</span>
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
              <span className="text-3xl font-bold">{totalClasses}</span>
            </div>

            <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <span className="text-3xl font-bold">{totalCompleted}</span>
            </div>

            <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm text-muted-foreground">Upcoming</span>
              </div>
              <span className="text-3xl font-bold">{totalUpcoming}</span>
            </div>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {platformsData.map((platform) => (
              <AccordionItem key={platform.id} value={platform.id}>
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
                    <Progress value={platform.progress} className="h-2 mb-4" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Classes
                          </span>
                          <span className="font-medium">
                            {platform.classes}
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
                            {platform.completed}
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
                            {platform.upcoming}
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
                            {new Date(platform.nextClass).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
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
