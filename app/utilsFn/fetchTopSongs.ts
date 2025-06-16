import { cache } from "react";
import { SongType } from "../types/types";
const playlist_id = "2DCBk0AdKhUxb2ANXckhMO";

// top songs for intro screen
const fetchTopSongsOriginal = async (token: string) => {
  try {
    console.log(`🎵 Making API call for top songs playlist`);
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 }, // Cache for 1 hour (playlist changes occasionally)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const items = data.tracks.items
      .filter(({ track }: { track: SongType }) => track.name.length < 10)
      .slice(0, 4);
    return items;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

// 🚀 Cached version - combines Next.js caching + React cache deduplication
export const fetchTopSongs = cache(fetchTopSongsOriginal);
