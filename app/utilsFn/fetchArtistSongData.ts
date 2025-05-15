import axios from "axios";

// fetching individual song data
export const fetchArtistSongData = async (artistID: string, token: string) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${artistID}/top-tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.tracks;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return null;
  }
};
