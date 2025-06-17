"use client";

import getColorPalette from "@/app/utilsFn/colorFn/getColorPalette";
import { useEffect, useState } from "react";
import {
  type SongDetails,
  type VideoItem,
  type ApiResponse,
  iconVariants,
} from "@/app/types/types";
import VideoCardGrid from "./video-card-grid";
import Icon from "../utils/Icon";
import VideoCardList from "./video-card-list";
type RelatedMediaProps = {
  dominantColor: string;
};

type filterTypes = "all" | "remix" | "lyrics" | "effects";

export default function RelatedMedia({ dominantColor }: RelatedMediaProps) {
  const [songDetails, setSongDetails] = useState<SongDetails | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [originalVideos, setOriginalVideos] = useState<VideoItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<filterTypes>("all");
  const [loading, setLoading] = useState(true);
  const [listViewActive, setListViewActive] = useState<boolean>(false);

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
      fetchMusicVideos(songDetails.songName, songDetails.artistName);
    }
  }, [songDetails]);

  const fetchMusicVideos = async (songName: string, artistName: string) => {
    try {
      const response = await fetch("/api/music-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          song_name: songName,
          artist_name: artistName,
          max_results: 16,
        }),
      });

      const data: ApiResponse = await response.json();

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
      console.error("Error fetching music videos:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filter: filterTypes) => {
    if (filter === "all") {
      setVideos(originalVideos);
      setActiveFilter("all");
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
      setActiveFilter("effects");
      return;
    }

    const videoWithRemix = originalVideos.filter((video: VideoItem) =>
      video.title.toLowerCase().includes(filter)
    );
    setVideos(videoWithRemix);
    setActiveFilter(filter);
  };
  const toggleView = () => setListViewActive((prev) => !prev);

  return (
    <div className="w-full">
      <div
        className="pl-8 pb-8 pt-32"
        style={{
          background: getColorPalette(dominantColor),
        }}
      >
        <h2 className="text-8xl font-extrabold mb-2">Related Media</h2>
      </div>
      {
        <>
          <div
            style={{
              background: `linear-gradient(to bottom, ${dominantColor}, transparent 88%, transparent 100%)`,
            }}
          >
            <div className="flex justify-between items-center px-8">
              <div className="pt-7 pb-8 flex gap-2">
                {Object.entries({
                  all: "All videos",
                  lyrics: "Lyrics",
                  remix: "Remix",
                  effects: "Effects",
                } as Record<filterTypes, string>).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleFilter(key as filterTypes)}
                    className={`${
                      activeFilter === key
                        ? "bg-spotify-green text-black"
                        : "border border-gray-300 hover:border-white"
                    } rounded-[20px] px-4 py-1 w-fit flex gap-2 font-medium text-[14px] hover:scale-102 cursor-pointer transition-all`}
                  >
                    {key !== "all" && (
                      <Icon
                        variant={key as iconVariants}
                        size={key !== "remix" ? 16 : 13}
                        className={activeFilter === key ? "invert" : ""}
                      />
                    )}
                    {value}
                  </button>
                ))}
                <div className="rounded-[20px] px-4 py-1 text-[14px] font-extralight bg-spotify-gray bg-opacity-25">
                  {videos.length} Videos
                </div>
              </div>
              <span onClick={toggleView}>
                <Icon
                  variant={listViewActive ? "grid" : "list"}
                  size={16}
                  className="opacity-80 hover:opacity-100 hover:scale-102 transition-all cursor-pointer"
                />
              </span>
            </div>
            {loading && (
              <p className="px-8 mb-2 mt-6">Loading related content ...</p>
            )}
            {videos.length > 0 && (
              <p className="px-8 mb-2 mt-6">Discover related content</p>
            )}
            {!loading && videos.length === 0 && (
              <p className="px-8 mb-2 mt-6">No videos were found.</p>
            )}
          </div>
          <div
            className={`${
              listViewActive
                ? "flex flex-col gap-2"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            } px-8 pb-8`}
          >
            {videos.length > 0 &&
              videos.map((video, index) =>
                listViewActive ? (
                  <VideoCardList
                    key={`${video.video_id}-${index}`}
                    video={video}
                  />
                ) : (
                  <VideoCardGrid
                    key={`${video.video_id}-${index}`}
                    video={video}
                  />
                )
              )}
          </div>
        </>
      }
    </div>
  );
}
