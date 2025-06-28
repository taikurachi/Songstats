import axios from "axios";

export async function getLyricsFromMusixmatch(isrc: string) {
  try {
    const response = await axios.get(
      "https://api.musixmatch.com/ws/1.1/track.lyrics.get",
      {
        params: {
          track_isrc: isrc,
          apikey: process.env.MUSIXMATCH_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching lyrics from Musixmatch:", error);
    throw new Error("Failed to fetch lyrics");
  }
}
