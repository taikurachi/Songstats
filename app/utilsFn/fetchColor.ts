import { cache } from "react";
import { getImageDominantColor } from "./color-thief.js";

export const originalFetchColor = async (imageUrl: string) => {
  try {
    // Check if we're on server-side (no window object)
    const isServerSide = typeof window === "undefined";

    if (isServerSide) {
      // Server-side: Call the function directly
      const dominantColorArr = await getImageDominantColor(imageUrl);
      return { dominantColorArr };
    } else {
      // Client-side: Make HTTP request to API route
      const response = await fetch(
        `/api/color-thief?imageUrl=${encodeURIComponent(imageUrl)}`,
        {
          next: { revalidate: 86400 }, // Cache for 24 hours (colors never change)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        dominantColorArr: data.dominantColorArr as number[],
      };
    }
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
