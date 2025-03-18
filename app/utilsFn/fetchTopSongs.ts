import axios from "axios";
const playlist_id = "37i9dQZEVXbMDoHDwVN2tF";

export const fetchTopSongs = async (token: string) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com//v1/playlists/${playlist_id}/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.tracks.items;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};
