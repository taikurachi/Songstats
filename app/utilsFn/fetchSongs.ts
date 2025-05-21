import axios from "axios";
import { debounce } from "@/app/utilsFn/debounce";

//fetching due to search
export const fetchSongs = async (
  query: string,
  token: string,
  limit: number = 20
) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: "track", limit: limit },
    });
    return response.data.tracks.items;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

export const debouncedFetchSongs = debounce(fetchSongs, 500);
