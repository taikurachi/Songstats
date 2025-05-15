import axios from "axios";

export const fetchSongDetails = async (
  artistName: string,
  songName: string
) => {
  try {
    // using perplexity api
    const response = await axios.get("/api/chat", {
      params: {
        artistName,
        songName,
      },
    });
    return response.data;
  } catch (err) {
    console.error(err);
  }
};
