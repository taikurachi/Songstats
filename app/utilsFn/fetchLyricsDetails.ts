import axios from "axios";

export const fetchLyricsDetails = async (
  artistName: string,
  songName: string,
  albumName: string,
  lyrics: string
) => {
  try {
    // using perplexity api

    const response = await axios.post("/api/chat", {
      lyrics,
      artistName,
      songName,
      albumName,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};
