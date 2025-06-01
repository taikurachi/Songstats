import axios from "axios";

export const fetchArtistData = async (artistIds: string[], token: string) => {
  try {
    const res = await Promise.all(
      artistIds.map((artistId) =>
        axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      )
    );
    const artistData = res.map((response) => response.data);
    return artistData;
  } catch (error) {
    console.error(error);
    return [];
  }
};
