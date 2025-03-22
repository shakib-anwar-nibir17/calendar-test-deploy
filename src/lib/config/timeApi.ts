// Time API configuration
export const TIME_API_CONFIG = {
  // Replace with your actual Time API endpoint
  baseUrl: "https://timeapi.io/api",

  // Add any API keys or authentication details
  apiKey: process.env.NEXT_PUBLIC_TIME_API_KEY ?? "",

  // Configure how often to sync (in milliseconds)
  syncInterval: 5 * 60 * 1000, // 5 minutes

  // Configure event display
  eventColor: "#3788d8",

  // Configure which endpoints to use
  endpoints: {
    events: "/events",
    // Add other endpoints as needed
  },
};
