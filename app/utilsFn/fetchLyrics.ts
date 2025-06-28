import { getLyricsFromMusixmatch } from "./lyrics-api";

export const fetchLyrics = async (isrc: string) => {
  try {
    // Check if we're on server-side (no window object)
    const isServerSide = typeof window === "undefined";

    if (isServerSide) {
      // Server-side: Call the function directly
      console.log("Fetching lyrics server-side...");
      const data = await getLyricsFromMusixmatch(isrc);
      return data?.message?.body?.lyrics?.lyrics_body || "";
    } else {
      // Client-side: Make HTTP request to API route
      console.log("Fetching lyrics client-side...");
      const url = `/api/lyrics?isrc=${isrc}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data?.message?.body?.lyrics?.lyrics_body || "";
    }
  } catch (err) {
    console.error("Error fetching lyrics:", err);
    return "";
  }
};
