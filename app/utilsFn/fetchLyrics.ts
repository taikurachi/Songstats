import axios from "axios";

export const fetchLyrics = async (isrc: string) => {
  try {
    const res = await axios.get(`/api/lyrics?isrc=${isrc}`);
    return res.data.message.body.lyrics.lyrics_body;
  } catch (err) {
    console.error(err);
  }
};
