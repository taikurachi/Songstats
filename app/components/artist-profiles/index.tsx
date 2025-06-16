"use client";
import { useToken } from "@/app/context/tokenContext";
import { SongType } from "@/app/types/types";
import { useArtistData } from "@/app/hooks/useArtistData";
import Image from "next/image";

export default function ArtistProfiles({ songData }: { songData: SongType }) {
  const { token } = useToken();

  // Use the cached query hook
  const {
    data: artistData = [],
    isLoading,
    error,
  } = useArtistData(
    songData.artists.map((artist) => artist.id),
    token || ""
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex">
        {/* Skeleton loading for artist profiles */}
        {songData.artists.map((_, index) => (
          <div
            key={index}
            className="w-[30px] h-[30px] bg-gray-600 rounded-full animate-pulse"
            style={{ marginLeft: index > 0 ? -10 : 0 }}
          />
        ))}
      </div>
    );
  }

  // Show error state (optional)
  if (error) {
    console.error("Failed to load artist data:", error);
    // Fallback to just showing artist names or empty state
    return null;
  }

  return (
    <div
      className="flex"
      style={{
        marginRight: artistData?.length ? (artistData.length - 1) * -10 : 0,
      }}
    >
      {artistData?.map((artist, index) => (
        <div key={index} className="w-[30px] h-[30px] relative">
          <Image
            style={{ marginLeft: index * -10 }}
            className="rounded-full inline-block"
            src={artist.images[0].url}
            layout="fill"
            objectFit="contain"
            alt={`${artist.name} image`}
          />
        </div>
      ))}
    </div>
  );
}
