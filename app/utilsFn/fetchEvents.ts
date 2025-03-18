import axios from "axios";

export const fetchEvents = async (artistName: string) => {
  try {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://your-production-url.com" // Use the production base URL
        : "http://localhost:3000"; // Use localhost URL during development

    const url = `${baseUrl}/api/events?artistName=${encodeURIComponent(
      artistName
    )}`;
    const res = await axios.get(url);
    return res?.data?._embedded?.events || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};
