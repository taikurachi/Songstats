export type SpotifyAPIResponse<T> = {
  data: T | null;
  error: string | null;
};

export type ArtistType = {
  id: string;
  name: string;
  popularity: number;
  genres: string[];
  href: string;
  images: { url: string }[];
};
export type SpotifyUserDataResponse = {
  display_name: string;
  images: { url: string }[];
  followers: { total: number };
};
export type SpotifyFollowingResponse = {
  artists: { items: ArtistType[]; total: number };
};

export type SpotifyTopArtistsResponse = {
  data: { items: ArtistType[] };
};

export default async function fetchSpotifyData<T>(
  accessToken: string,
  endpoint: string,
  timeRange?: string
): Promise<SpotifyAPIResponse<T>> {
  try {
    const url = new URL(`https://api.spotify.com${endpoint}`);
    if (timeRange) {
      url.searchParams.append("time_range", timeRange);
    }

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();

    if (response.status === 401) {
      try {
        console.log("trying to get refresh token");
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/refresh`
        );

        if (!refreshResponse.ok) {
          console.error("Failed to refresh token:", refreshResponse.statusText);
        } else {
          const refreshData = await refreshResponse.json();
          console.log("New token data:", refreshData);
        }
      } catch (error) {
        console.error("Error during refresh token fetch:", error);
      }
    }

    if (!response.ok || !data) {
      return { data: null, error: data.error?.message || "Unknown error" };
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message || "Network error" };
  }
}
