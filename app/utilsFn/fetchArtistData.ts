import { cache } from "react";

const fetchArtistDataOriginal = async (artistIds: string[], token: string) => {
  try {
    console.log(`🎤 Making API calls for ${artistIds.length} artists`);
    const res = await Promise.all(
      artistIds.map(async (artistId) => {
        const response = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            next: { revalidate: 1800 }, // Cache for 30 minutes (artist data changes rarely)
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
      })
    );
    return res;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// 🚀 Cached version - combines Next.js caching + React cache deduplication
export const fetchArtistData = cache(fetchArtistDataOriginal);
