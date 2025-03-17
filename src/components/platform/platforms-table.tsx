import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Calendar, DollarSign } from "lucide-react";
import { formatDate } from "@/utils/formate-iso-date";
import { Platform } from "@/store/states/platforms";

interface PlatformsTableProps {
  readonly platforms: Platform[];
}

export function PlatformsTable({ platforms }: PlatformsTableProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get payment type badge color
  const getPaymentBadgeColor = (type: Platform["paymentType"]) => {
    switch (type) {
      case "Weekly":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "Bi-Weekly":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "Monthly":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "Upfront":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Teaching Platforms</CardTitle>
        <CardDescription>
          Manage all the platforms where you teach mathematics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {platforms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No platforms added yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first teaching platform to get started
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform Name</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Next Pay Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.map((platform) => (
                <TableRow key={platform.id}>
                  <TableCell className="font-medium">{platform.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getPaymentBadgeColor(platform.paymentType)}
                    >
                      {platform.paymentType.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {formatCurrency(platform.hourlyRate)}
                  </TableCell>
                  <TableCell>
                    {platform.nextPayData ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(platform.nextPayData)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Not scheduled
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
