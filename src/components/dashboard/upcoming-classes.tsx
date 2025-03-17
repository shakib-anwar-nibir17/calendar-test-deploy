import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"

export function UpcomingClasses() {
  // This would typically come from an API or database
  const hasUpcomingClasses = true

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Next Class
        </CardTitle>
        <CardDescription>Your upcoming scheduled classes</CardDescription>
      </CardHeader>
      <CardContent>
        {hasUpcomingClasses ? (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-md">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No upcoming classes</p>
            <button className="mt-4 text-primary text-sm hover:underline">Browse available classes</button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

