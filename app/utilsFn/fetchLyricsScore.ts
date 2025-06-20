import axios from "axios";

export const fetchLyricsScore = async (lyrics: string) => {
  try {
    const response = await axios.post("/api/lyrics-score", {
      lyrics,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};
