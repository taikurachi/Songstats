import axios from "axios";
import { SongType } from "../types/types";
const playlist_id = "2DCBk0AdKhUxb2ANXckhMO";

// top songs for intro screen
export const fetchTopSongs = async (token: string) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlist_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const items = response.data.tracks.items
      .filter(({ track }: { track: SongType }) => track.name.length < 10)
      .slice(0, 4);
    return items;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};
