"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { DayValue, Platform } from "@/store/states/platforms";
import { daysOfWeek } from "@/utils/platform-utils";
import { useUpdatePlatformMutation } from "@/store/services/platform.service";
import { toast } from "sonner";

interface UpdatePlatformModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly platform: Platform | null;
  readonly refetch: () => void;
}

export function UpdatePlatformModal({
  isOpen,
  onClose,
  platform,
  refetch,
}: UpdatePlatformModalProps) {
  const [updatePlatform, { isLoading }] = useUpdatePlatformMutation();
  const [name, setName] = useState("");
  const [paymentType, setPaymentType] =
    useState<Platform["paymentType"]>("Upfront");
  const [day, setDay] = useState<DayValue>("monday");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    setName(platform?.name ?? "");
    setPaymentType(platform?.paymentType ?? "Upfront");
    setHourlyRate(platform?.hourlyRate ?? 0);

    // Ensure nextPayDate is a valid date
    setDate(
      platform?.nextPayDate ? new Date(platform.nextPayDate) : new Date()
    );

    setDay(platform?.day ?? "monday");
  }, [platform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatableData = {
      id: platform?._id ?? "",
      name: name,
      paymentType: paymentType,
      hourlyRate: hourlyRate,
      nextPayDate: date?.toISOString() ?? "",
      day: day,
    };

    const response = await updatePlatform(updatableData);
    if (response.data?.success === true) {
      toast.success("Platform updated successfully.");
      refetch();
    } else {
      toast.error("Failed to update platform.");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Teaching Platform</DialogTitle>
            <DialogDescription>
              Enter the details of the online platform where you teach
              mathematics.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Platform Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., MathWhiz, TutorConnect"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment-type">Payment Type</Label>
              <Select
                value={paymentType}
                onValueChange={(value: Platform["paymentType"]) =>
                  setPaymentType(value)
                }
                required
              >
                <SelectTrigger id="payment-type">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Upfront">Upfront</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
              <Input
                id="hourly-rate"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                placeholder="e.g., 45.00"
                required
              />
            </div>
            {(paymentType === "Bi-Weekly" || paymentType === "Monthly") && (
              <div className="grid gap-2">
                <Label>Next Pay Date</Label>
                <div className="flex flex-col gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(day) => day && setDate(day)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {paymentType === "Weekly" && (
              <div className="grid gap-2">
                <Label htmlFor="payment-type">Payment Day</Label>
                <Select
                  value={day}
                  onValueChange={(value: DayValue) => setDay(value)}
                  required
                >
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select Your Pay Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              Update Platform
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
