import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToMongoDB();

  if (req.method === "GET") {
    try {
      const events = await CalendarEventModel.find();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events", error });
    }
  } else if (req.method === "POST") {
    try {
      const newEvent = await CalendarEventModel.create(req.body);
      res.status(201).json(newEvent);
    } catch (error) {
      res.status(400).json({ message: "Error creating event", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
