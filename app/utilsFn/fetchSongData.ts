import { cache } from "react";

// 🚀 Next.js fetch with caching and React cache deduplication
const fetchSongDataOriginal = async (id: string, token: string) => {
  try {
    console.log(`🎵 Making API call for song: ${id}`);
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching songs:", error);
    return null;
  }
};

// 🚀 Cached version - combines Next.js caching + React cache deduplication
export const fetchSongData = cache(fetchSongDataOriginal);
