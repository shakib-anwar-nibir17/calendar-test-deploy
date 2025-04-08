This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

update

export async function PUT(
request: Request,
context: { params: { id: string } }
) {
try {
const { params } = context;
console.log(params.id); // ✅ Ensure `params` is accessed from `context`
const id = params?.id;
if (!id || !mongoose.Types.ObjectId.isValid(id)) {
return NextResponse.json(
{ error: "Invalid event ID format" },
{ status: 400 }
);
}

    const data = await request.json();
    console.log("Received update:", data);

    await connectToMongoDB();

    const eventId = id;
    const existingEvent = await CalendarEventModel.findById(eventId);
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const platform = await Platform.findOne({ name: data.platform });
    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 400 }
      );
    }

    // Determine updated recurrence
    let isRecurring = Boolean(data.isRecurring);
    let recurrencePattern = data.recurrencePattern;

    switch (platform.paymentType) {
      case "Weekly":
      case "Bi-Weekly":
      case "Monthly":
        recurrencePattern = recurrencePattern || platform.paymentType;
        break;
      case "Upfront":
        recurrencePattern = "Upfront";
        break;
      default:
        isRecurring = false;
        recurrencePattern = undefined;
    }

    // Update the main event
    existingEvent.platform = data.platform;
    existingEvent.start = data.start;
    existingEvent.end = data.end;
    existingEvent.backgroundColor = data.backgroundColor;
    existingEvent.displayStart = data.displayStart;
    existingEvent.displayEnd = data.displayEnd;
    existingEvent.hoursEngaged = data.hoursEngaged;
    existingEvent.status = data.status;
    existingEvent.allday = data.allday;
    existingEvent.timeZone = data.timeZone;
    existingEvent.isRecurring = isRecurring;
    existingEvent.recurrencePattern = recurrencePattern;

    await existingEvent.save();

    // Delete old recurring children
    await CalendarEventModel.deleteMany({ parentEventId: eventId });

    // Re-generate recurring children if still recurring
    if (isRecurring) {
      let instancesToGenerate = 4;
      let intervalValue = 1;
      let intervalType: "Weekly" | "Bi-Weekly" | "Monthly" | "Upfront";

      switch (platform.paymentType) {
        case "Bi-Weekly":
          intervalType = "Bi-Weekly";
          intervalValue = 2;
          break;
        case "Monthly":
          intervalType = "Monthly";
          break;
        case "Upfront":
          intervalType = "Upfront";
          intervalValue = 1;
          instancesToGenerate = 4;
          break;
        default:
          intervalType = "Weekly";
          intervalValue = 1;
      }

      let instanceDate = new Date(data.start);

      for (let i = 1; i <= instancesToGenerate; i++) {
        switch (intervalType) {
          case "Bi-Weekly":
            instanceDate = addWeeks(instanceDate, intervalValue);
            break;
          case "Monthly":
            instanceDate = addMonths(instanceDate, intervalValue);
            break;
          case "Upfront":
            instanceDate = addDays(instanceDate, intervalValue);
            break;
          default:
            instanceDate = addWeeks(instanceDate, intervalValue);
        }

        if (instanceDate < new Date()) continue;

        await CalendarEventModel.create({
          platform: data.platform,
          start: instanceDate,
          end: instanceDate, // Adjust in pre-save hook
          backgroundColor: data.backgroundColor,
          displayStart: data.displayStart,
          displayEnd: data.displayEnd,
          hoursEngaged: data.hoursEngaged,
          status: "active",
          allday: data.allday,
          timeZone: data.timeZone,
          isRecurring: false,
          parentEventId: existingEvent._id,
          recurrencePattern,
        });
      }
    }

    const updatedEvent = {
      id: existingEvent._id.toString(),
      platform: existingEvent.platform,
      start: existingEvent.start,
      end: existingEvent.end,
      backgroundColor: existingEvent.backgroundColor,
      displayStart: existingEvent.displayStart,
      displayEnd: existingEvent.displayEnd,
      hoursEngaged: existingEvent.hoursEngaged,
      status: existingEvent.status,
      allday: existingEvent.allday,
      timeZone: existingEvent.timeZone,
      isRecurring: existingEvent.isRecurring,
      recurrencePattern: existingEvent.recurrencePattern,
      createdAt: existingEvent.createdAt,
      updatedAt: existingEvent.updatedAt,
    };

    return NextResponse.json(updatedEvent, { status: 200 });

} catch (error) {
console.error("❌ Failed to update event:", error);
return NextResponse.json(
{ error: "Failed to update event" },
{ status: 500 }
);
}
}
