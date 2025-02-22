import axios from "axios";

export const fetchEvents = async (artistName: string) => {
  try {
    const res = await axios.get(
      `/api/events?artistName${encodeURIComponent(artistName)}`
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};
