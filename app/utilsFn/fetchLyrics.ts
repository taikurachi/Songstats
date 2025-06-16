import { cache } from "react";

const fetchLyricsOriginal = async (isrc: string) => {
  try {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://your-production-url.com" // Use the production base URL
        : "http://localhost:3000"; // Use localhost URL during development

    const url = `${baseUrl}/api/lyrics?isrc=${isrc}`;
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours (lyrics don't change)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data?.message?.body?.lyrics?.lyrics_body || "";
  } catch (err) {
    console.error(err);
    return "";
  }
};

// 🚀 Cached version - combines Next.js caching + React cache deduplication
export const fetchLyrics = cache(fetchLyricsOriginal);
