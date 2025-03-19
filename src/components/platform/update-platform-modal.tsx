"use client";

import type React from "react";
import { useState } from "react";
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
import { Platform } from "@/store/states/platforms";
import { addPlatform } from "@/store/slices/platform.slice";
import { useAppDispatch } from "@/store/hooks";

interface AddPlatformModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function AddPlatformModal({ isOpen, onClose }: AddPlatformModalProps) {
  const [name, setName] = useState("");
  const [paymentType, setPaymentType] =
    useState<Platform["paymentType"]>("Weekly");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const dispatch = useAppDispatch();

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
                onValueChange={(
                  value: "Weekly" | "Bi-Weekly" | "Monthly" | "Upfront"
                ) => setPaymentType(value)}
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
            <div className="grid gap-2">
              <Label>Next Pay Date (Optional)</Label>
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
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
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
