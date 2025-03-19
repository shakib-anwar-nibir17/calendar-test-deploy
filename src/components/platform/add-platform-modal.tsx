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
import { addPlatform } from "@/store/slices/platform.slice";
import { useAppDispatch } from "@/store/hooks";
import { daysOfWeek } from "@/utils/platform-utils";

interface AddPlatformModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function AddPlatformModal({ isOpen, onClose }: AddPlatformModalProps) {
  const [name, setName] = useState("");
  const [paymentType, setPaymentType] =
    useState<Platform["paymentType"]>("Upfront");
  const [day, setDay] = useState<DayValue>("monday");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const dispatch = useAppDispatch();

  useEffect(() => {}, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextPayData = date ? date.toISOString() : "";

    dispatch(
      addPlatform({
        name: name,
        paymentType: paymentType,
        hourlyRate: hourlyRate,
        nextPayData: nextPayData,
      })
    );

    // Reset form
    setName("");
    setPaymentType("Weekly");
    setHourlyRate(0);
    setDate(undefined);

    onClose();
  };

  console.log(date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Teaching Platform</DialogTitle>
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
            {paymentType === "Bi-Weekly" ||
              (paymentType === "Monthly" && (
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
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))}

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
            <Button type="submit">Add Platform</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
