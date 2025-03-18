import axios from "axios";
export const fetchColor = async (imageUrl: string) => {
  try {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://your-production-url.com" // Use the production base URL
        : "http://localhost:3000"; // Use localhost URL during development

    const url = `${baseUrl}/api/colorThief?imageUrl=${encodeURIComponent(
      imageUrl
    )}`;
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error("error ", error);
  }
};
