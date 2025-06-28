import { cache } from "react";

const fetchEventsOriginal = async (artistName: string) => {
  try {
    const url = `/api/events?artistName=${encodeURIComponent(artistName)}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour (events change frequently)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const eventsData = data?._embedded?.events;
    if (!eventsData) return [];
    return eventsData.length > 6 ? eventsData.slice(0, 6) : eventsData;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// 🚀 Cached version - combines Next.js caching + React cache deduplication
export const fetchEvents = cache(fetchEventsOriginal);
