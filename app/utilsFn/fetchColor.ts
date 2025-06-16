import { cache } from "react";

export const originalFetchColor = async (imageUrl: string) => {
  try {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://your-production-url.com" // Replace with your production URL
        : "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/colorThief?imageUrl=${encodeURIComponent(imageUrl)}`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours (colors never change)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // The colorThief API returns { dominantColorArr: [r, g, b] }
    // We'll normalize it to { dominantColor: [r, g, b] } for consistency
    return {
      dominantColorArr: data.dominantColorArr as number[],
    };
  } catch (error) {
    console.error("Error fetching color:", error);
    // Return a default color if the API fails
    return {
      dominantColorArr: [128, 128, 128] as number[],
    };
  }
};

// 🚀 Cached version - combines Next.js caching + React cache deduplication
export const fetchColor = cache(originalFetchColor);
