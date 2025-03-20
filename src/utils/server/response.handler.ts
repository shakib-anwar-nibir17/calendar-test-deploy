import { STATUS_CODES } from "http";
import { HTTPStatusCode } from "./http-status-codes";

// Success response type
interface SuccessResponse<T> {
  success: true;
  code: HTTPStatusCode;
  data: T;
  message?: string;
}

// Function to send a success response in Next.js 14
export const sendResponse = <T>(
  data: T,
  code: HTTPStatusCode,
  message?: string
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    code,
    data,
    message: message ?? STATUS_CODES[code] ?? "Success",
  };

  return new Response(JSON.stringify(response), {
    status: code,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
