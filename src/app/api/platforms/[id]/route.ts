import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import Platform from "@/models/platform.model";

// Get a platform by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToMongoDB();

  try {
    const platform = await Platform.findById(params.id).populate("events");

    if (!platform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(platform, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}

// Update a platform
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToMongoDB();

  try {
    const updates = await req.json();
    const updatedPlatform = await Platform.findByIdAndUpdate(
      params.id,
      updates,
      { new: true }
    );

    if (!updatedPlatform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPlatform, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}

// Delete a platform
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToMongoDB();

  try {
    const deletedPlatform = await Platform.findByIdAndDelete(params.id);

    if (!deletedPlatform) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Platform deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
