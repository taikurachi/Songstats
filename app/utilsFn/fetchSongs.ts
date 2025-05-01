import axios from "axios";
import { debounce } from "@/app/utilsFn/debounce";

export const fetchSongs = async (query: string, token: string) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: "track" },
    });
    return response.data.tracks.items;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

export const debouncedFetchSongs = debounce(fetchSongs, 300);
