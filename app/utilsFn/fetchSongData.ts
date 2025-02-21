import axios from "axios";
export const fetchSongData = async (id: string, token: string) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return null;
  }
};
