import { connectToMongoDB } from "@/lib/mongodb";
import Platform from "@/models/platform.model";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToMongoDB();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const platform = await Platform.findById(id).populate("events");
      if (!platform)
        return res.status(404).json({ message: "Platform not found" });
      res.status(200).json(platform);
    } catch (error) {
      res.status(500).json({ message: "Error fetching platform", error });
    }
  } else if (req.method === "PUT") {
    try {
      const updatedPlatform = await Platform.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(updatedPlatform);
    } catch (error) {
      res.status(400).json({ message: "Error updating platform", error });
    }
  } else if (req.method === "DELETE") {
    try {
      await Platform.findByIdAndDelete(id);
      res.status(200).json({ message: "Platform deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting platform", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
