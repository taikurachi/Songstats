import { useQuery } from "@tanstack/react-query";
import { fetchSongData } from "@/app/utilsFn/fetchSongData";
import { fetchColor } from "@/app/utilsFn/fetchColor";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";

export function useSongData(songId: string, token: string) {
  return useQuery({
    queryKey: ["song", songId],
    queryFn: () => fetchSongData(songId, token),
    enabled: !!token && !!songId,
    staleTime: 10 * 60 * 1000, // 10 minutes - song data rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
    retry: (failureCount, error) => {
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status: number }).status;
        if (status === 401 || status === 403 || status === 404) return false;
      }
      return failureCount < 2;
    },
  });
}

export function useColorData(imageUrl: string) {
  return useQuery({
    queryKey: ["color", imageUrl],
    queryFn: () => fetchColor(imageUrl),
    enabled: !!imageUrl,
    staleTime: 60 * 60 * 1000, // 1 hour - colors never change
    gcTime: 2 * 60 * 60 * 1000, // 2 hours in memory
    select: (data) => ({
      dominantColorArr: data.dominantColorArr,
      dominantColorRGB: convertToRGB(data.dominantColorArr),
    }),
  });
}

// Combined hook for both song and color data
export function useSongPageData(songId: string, token: string) {
  const songQuery = useSongData(songId, token);

  const colorQuery = useColorData(
    songQuery.data?.album?.images?.[0]?.url || ""
  );

  return {
    songData: songQuery.data,
    colorData: colorQuery.data,
    isLoading: songQuery.isLoading || colorQuery.isLoading,
    error: songQuery.error || colorQuery.error,
    isSuccess: songQuery.isSuccess && colorQuery.isSuccess,
  };
}
