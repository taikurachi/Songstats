import axios from "axios";

export const fetchSongs = async (query: string, token: string) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: "track", limit: 10 },
    });
    return response.data.tracks.items;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};
