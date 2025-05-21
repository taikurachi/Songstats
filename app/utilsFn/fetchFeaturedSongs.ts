import axios from "axios";
import { AlbumType, ArtistType, SongType } from "../types/types";

// fetching featured songs where given artist is not the main artist
export const fetchFeaturedSongs = async (artistID: string, token: string) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${artistID}/albums`,
      {
        params: {
          include_groups: "appears_on",
          limit: 50,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const relevantAlbums = response.data.items.filter((album: AlbumType) => {
      const isCompilation = album.album_type === "compilation";
      const hasGenericTitle =
        /relaxing|mood|sleep|chill|sad|happy|vibes|playlist|20\d\d/.test(
          album.name.toLowerCase()
        );
      return !isCompilation && !hasGenericTitle;
    });
    if (relevantAlbums.length === 0) return [];
    const limitedAlbums = relevantAlbums.slice(0, 6);
    const albumIDs = limitedAlbums.map((album: AlbumType) => album.id);
    const featuredSongs: SongType[] = [];

    const albumsResponse = await axios.get(
      `https://api.spotify.com/v1/albums`,
      {
        params: {
          ids: albumIDs.join(","), // Comma-separated list of IDs
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    for (const album of albumsResponse.data.albums) {
      if (album.tracks && album.tracks.items) {
        const matchedTracks = album.tracks.items.filter(
          (track: { artists: ArtistType[] }) =>
            track.artists.some((artist: ArtistType) => artist.id === artistID)
        );

        for (const track of matchedTracks) {
          featuredSongs.push({
            ...track,
            imageURL:
              album.images && album.images.length > 0
                ? album.images[0].url
                : "",
          });

          if (featuredSongs.length >= 6) break;
        }
      }

      if (featuredSongs.length >= 6) break;
    }

    return featuredSongs;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return [];
  }
};
