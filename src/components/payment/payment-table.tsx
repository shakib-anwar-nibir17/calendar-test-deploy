"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppSelector } from "@/store/hooks";
import { CalendarEvent } from "@/store/states/calender";
import { Platform } from "@/store/states/platforms";
import { useEffect, useState } from "react";

interface Payment {
  calenderEvent: CalendarEvent;
  platform: Platform;
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const calculateTotalPay = (hours: number, rate: number) => {
  const totalPay = hours * rate;
  return formatCurrency(totalPay);
};

export default function PaymentsPage() {
  const platforms = useAppSelector((state) => state.platforms.platforms);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const storedPayments = localStorage.getItem("calendarEvents");
    if (storedPayments) {
      const parsedPayments: CalendarEvent[] = JSON.parse(storedPayments);

      const newData = parsedPayments
        .filter((payment) => payment.status === "completed")
        .map((payment) => {
          const platform = platforms.find((p) => p.name === payment.platform);

          return platform ? { calenderEvent: payment, platform } : null;
        })
        .filter((item): item is Payment => item !== null); // Type guard

      setPayments(newData);
    }
  }, [platforms]); // Re-run when platforms change

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Payment History</h1>
      <Table>
        <TableCaption>A list of your recent payments.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead className="text-right">Hourly Rate</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead className="text-right">Total Pay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.calenderEvent.id}>
              <TableCell>{payment.calenderEvent.id}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(payment.platform.hourlyRate)}
              </TableCell>
              <TableCell className="text-right">
                {payment.calenderEvent.hoursEngaged?.toFixed(2)}
              </TableCell>
              <TableCell>{payment.calenderEvent.platform}</TableCell>
              <TableCell className="text-right font-medium">
                {calculateTotalPay(
                  payment.calenderEvent.hoursEngaged ?? 0,
                  payment.platform.hourlyRate
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
