import { connectToMongoDB } from "@/lib/mongodb";
import Platform from "@/models/platform.model";
import { sendResponse } from "@/utils/server/response.handler";
import { HTTP_STATUS_CODES } from "@/utils/server/http-status-codes";
import { sendError } from "@/utils/server/error.handler";

// Get a platform by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToMongoDB();

  try {
    const platform = await Platform.findById(params.id).populate("events");

    if (!platform) {
      return sendError(HTTP_STATUS_CODES.NOT_FOUND, "Platform not found");
    }

    return sendResponse(
      platform,
      HTTP_STATUS_CODES.OK,
      "Platform fetched successfully"
    );
  } catch (error) {
    return sendError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Error fetching platform",
      error instanceof Error ? error.message : "Unknown error"
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
      {
        new: true,
      }
    );

    if (!updatedPlatform) {
      return sendError(HTTP_STATUS_CODES.NOT_FOUND, "Platform not found");
    }

    return sendResponse(
      updatedPlatform,
      HTTP_STATUS_CODES.OK,
      "Platform updated successfully"
    );
  } catch (error) {
    return sendError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Error updating platform",
      error instanceof Error ? error.message : "Unknown error"
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
      return sendError(HTTP_STATUS_CODES.NOT_FOUND, "Platform not found");
    }

    return sendResponse(
      null,
      HTTP_STATUS_CODES.OK,
      "Platform deleted successfully"
    );
  } catch (error) {
    return sendError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Error deleting platform",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
