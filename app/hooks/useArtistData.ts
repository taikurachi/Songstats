import { useQuery } from "@tanstack/react-query";
import { fetchArtistData } from "@/app/utilsFn/fetchArtistData";
import { ArtistType } from "@/app/types/types";

export function useArtistData(artistIds: string[], token: string) {
  return useQuery({
    // Unique key for this query - includes all artist IDs
    queryKey: ["artists", artistIds.sort().join(",")],

    // The function that fetches the data
    queryFn: () => fetchArtistData(artistIds, token),

    // Only run the query if we have both artistIds and token
    enabled: !!token && artistIds.length > 0,

    // Cache settings (can override global defaults)
    staleTime: 5 * 60 * 1000, // 5 minutes - artist data doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory

    // Retry settings
    retry: (failureCount, error) => {
      // Don't retry on 401/403 (auth errors)
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status: number }).status;
        if (status === 401 || status === 403) return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },

    // Transform the data if needed
    select: (data: ArtistType[]) => {
      // Sort artists by popularity (most popular first)
      return data.sort((a, b) => b.popularity - a.popularity);
    },
  });
}
