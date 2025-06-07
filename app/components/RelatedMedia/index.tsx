"use client";

import getColorPalette from "@/app/utilsFn/colorFn/getColorPalette";
import { useEffect, useState } from "react";
import {
  type SongDetails,
  type VideoItem,
  type ApiResponse,
} from "@/app/types/types";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import VideoCard from "./Video";
import Icon from "../utils/Icon";
type RelatedMediaProps = {
  dominantColor: string;
};

export default function RelatedMedia({ dominantColor }: RelatedMediaProps) {
  const [songDetails, setSongDetails] = useState<SongDetails | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [originalVideos, setOriginalVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedDetails = sessionStorage.getItem("songDetails");
    if (storedDetails) {
      console.log("Found song details:", storedDetails);
      setSongDetails(JSON.parse(storedDetails));
    } else {
      console.log("No song details found in sessionStorage");
    }
  }, []);

  // Fetch videos when song details are available
  useEffect(() => {
    if (songDetails?.songName && songDetails?.artistName) {
      console.log(
        `Fetching videos for: ${songDetails.artistName} - ${songDetails.songName}`
      );
      fetchMusicVideos(songDetails.songName, songDetails.artistName);
    }
  }, [songDetails]);

  const fetchMusicVideos = async (songName: string, artistName: string) => {
    console.log("Starting video fetch...");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/music-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          song_name: songName,
          artist_name: artistName,
          max_results: 15,
        }),
      });

      console.log("API Response status:", response.status);
      const data: ApiResponse = await response.json();
      console.log("API Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log(`Successfully fetched ${data.videos?.length || 0} videos`);
      setVideos(data.videos || []);
      setOriginalVideos(data.videos || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch music videos";
      console.error("Error fetching music videos:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filter: "all" | "effects" | "lyrics" | "remix") => {
    if (filter === "all") {
      setVideos(originalVideos);
      return;
    }
    if (filter === "effects") {
      const effects = ["slowed", "reverb", "sped up"];
      const videosWithEffects = originalVideos.filter((video: VideoItem) =>
        effects.some((effect: string) =>
          video.title.toLowerCase().includes(effect)
        )
      );
      setVideos(videosWithEffects);
      return;
    }
    if (filter === "lyrics") {
      const videosWithLyrics = originalVideos.filter((video: VideoItem) =>
        video.title.toLowerCase().includes(filter)
      );
      setVideos(videosWithLyrics);
      return;
    }

    if (filter === "remix") {
      const videoWithRemix = originalVideos.filter((video: VideoItem) =>
        video.title.toLowerCase().includes(filter)
      );
      setVideos(videoWithRemix);
      return;
    }
  };

  // Debug: Show current state
  console.log("Current state:", {
    songDetails,
    videos: videos.length,
    loading,
    error,
  });

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-4xl font-bold mb-2">Related Media</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">
            Searching for related media...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-4xl font-bold mb-2">Related Media</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 mb-2">Error loading videos: {error}</p>
          <button
            onClick={() =>
              songDetails &&
              fetchMusicVideos(songDetails.songName, songDetails.artistName)
            }
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!songDetails) {
    return (
      <div className="p-6">
        <h2 className="text-4xl font-bold mb-2">Related Media</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 mb-2">
            No song details found in sessionStorage
          </p>
          <p className="text-yellow-600 text-sm">
            Make sure to navigate from a page that sets song details in
            sessionStorage
          </p>

          <button
            onClick={() => {
              const testData = {
                songName: "Shape of You",
                albumName: "÷ (Divide)",
                isrc: "GBAHS1700214",
                artistName: "Ed Sheeran",
              };
              sessionStorage.setItem("songDetails", JSON.stringify(testData));
              setSongDetails(testData);
            }}
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
          >
            Test with Ed Sheeran - Shape of You
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div
        className="pl-8 pb-8 pt-32"
        style={{
          background: getColorPalette(JSON.parse(dominantColor)),
        }}
      >
        <h2 className="text-8xl font-extrabold mb-2">Related Media</h2>
      </div>

      {videos.length > 0 ? (
        <div
          style={{
            background: `linear-gradient(to bottom, ${convertToRGB(
              JSON.parse(dominantColor)
            )}, transparent 12%, transparent 100%)`,
          }}
        >
          <div className="px-8 pt-7 pb-8 flex gap-2">
            <div
              onClick={() => handleFilter("all")}
              className="rounded-[20px] px-4 py-1 text-[14px] font-medium border border-gray-300 hover:border-white cursor-pointer hover:scale-102"
            >
              All videos
            </div>
            <div
              onClick={() => handleFilter("lyrics")}
              className="rounded-[20px] border border-gray-300 hover:border-white px-3 py-1 w-fit flex gap-2 font-medium text-[14px] hover:scale-102 cursor-pointer transition-all"
            >
              <Icon variant="lyrics" size={16} />
              Lyrics
            </div>
            <div
              onClick={() => handleFilter("remix")}
              className="rounded-[20px] border border-gray-300 hover:border-white px-3 py-1 w-fit flex gap-2 font-medium text-[14px] hover:scale-102 cursor-pointer transition-all"
            >
              <Icon variant="lyrics" size={16} />
              Remix
            </div>
            <div
              onClick={() => handleFilter("effects")}
              className="rounded-[20px] border border-gray-300 hover:border-white px-3 py-1 w-fit flex gap-2 font-medius text-[14px] hover:scale-102 cursor-pointer transition-all"
            >
              <Icon variant="effects" size={16} />
              Effects
            </div>
            <div className="rounded-[20px] px-4 py-1 text-[14px] font-extralight bg-spotify-gray bg-opacity-25">
              {videos.length} Videos
            </div>
          </div>
          <p className="px-8 mb-2 mt-6">Discover related content</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-8 pb-8">
            {videos.map((video, index) => (
              <VideoCard key={`${video.video_id}-${index}`} video={video} />
            ))}
          </div>{" "}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-4 text-gray-400">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">No videos found for this song</p>
          <button
            onClick={() =>
              fetchMusicVideos(songDetails.songName, songDetails.artistName)
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Again
          </button>
        </div>
      )}
    </div>
  );
}
