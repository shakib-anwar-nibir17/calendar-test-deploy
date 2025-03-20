import { connectToMongoDB } from "@/lib/mongodb";
import CalendarEventModel from "@/models/calendar-event.model";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToMongoDB();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const event = await CalendarEventModel.findById(id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event", error });
    }
  } else if (req.method === "PUT") {
    try {
      const updatedEvent = await CalendarEventModel.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );
      res.status(200).json(updatedEvent);
    } catch (error) {
      res.status(400).json({ message: "Error updating event", error });
    }
  } else if (req.method === "DELETE") {
    try {
      await CalendarEventModel.findByIdAndDelete(id);
      res.status(200).json({ message: "Event deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting event", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
