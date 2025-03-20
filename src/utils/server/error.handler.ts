import { STATUS_CODES } from "http";
import { HTTPStatusCode } from "./http-status-codes";

// Error response type
interface ErrorResponse {
  success: false;
  code: HTTPStatusCode;
  error: string;
  message?: string;
}

// Function to send an error response in Next.js 14
export const sendError = (
  code: HTTPStatusCode,
  error: string,
  message?: string
): Response => {
  const response: ErrorResponse = {
    success: false,
    code,
    error,
    message: message ?? STATUS_CODES[code] ?? "An error occurred",
  };

  return new Response(JSON.stringify(response), {
    status: code,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
