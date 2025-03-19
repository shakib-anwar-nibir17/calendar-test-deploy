import { connectToMongoDB } from "@/lib/mongodb";
import Platform from "@/models/platform.model";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToMongoDB();

  if (req.method === "GET") {
    try {
      const platforms = await Platform.find().populate("events");
      res.status(200).json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Error fetching platforms", error });
    }
  } else if (req.method === "POST") {
    try {
      const newPlatform = await Platform.create(req.body);
      res.status(201).json(newPlatform);
    } catch (error) {
      res.status(400).json({ message: "Error creating platform", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
