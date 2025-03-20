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

import { useGetPlatformsQuery } from "@/store/services/platform.service";
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
  const { data: platforms } = useGetPlatformsQuery();

  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!platforms) return;

    const storedPayments = localStorage.getItem("calendarEvents");
    if (storedPayments) {
      const parsedPayments: CalendarEvent[] = JSON.parse(storedPayments);

      const newData = parsedPayments
        .filter((payment) => payment.status === "completed")
        .map((payment) => {
          const platform = platforms.data?.find(
            (p) => p.name === payment.platform
          );

          return platform ? { calenderEvent: payment, platform } : null;
        })
        .filter((item): item is Payment => item !== null);

      setPayments(newData);
    }
  }, [platforms]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Payment History</h1>
      <Table>
        <TableHeader>
          {payments.length > 0 && (
            <TableRow>
              <TableHead className="text-left">Payment ID</TableHead>
              <TableHead className="text-right">Hourly Rate</TableHead>
              <TableHead className="text-right">Hours Engaged</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="text-right">Total Pay</TableHead>
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {payments.length > 0 ? (
            payments.map((payment) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                No payment data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
