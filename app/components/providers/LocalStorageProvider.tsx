"use client";
import { SongType } from "@/app/types/types";
import { useEffect } from "react";

const addAnalyzedDate = (songData: SongType): SongType => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Return a new object instead of mutating the original
  return {
    ...songData,
    analyzedDate: currentDate,
  };
};

export default function LocalStorageProvider({
  songData,
}: {
  songData: SongType;
}) {
  useEffect(() => {
    if (!songData) return;

    const currentHistory = localStorage.getItem("songHistory");
    const songWithDate = addAnalyzedDate(songData);

    // Store first song
    if (!currentHistory) {
      localStorage.setItem("songHistory", JSON.stringify([songWithDate]));
      return;
    }

    const newHistory = JSON.parse(currentHistory);

    // Find if song already exists
    const foundIndex = newHistory.findIndex(
      (song: SongType) => song.id === songData.id
    );

    if (foundIndex !== -1) {
      // Song exists: remove it from current position
      newHistory.splice(foundIndex, 1);
    }

    // Add song to the beginning (whether it's new or moved)
    newHistory.unshift(songWithDate);

    localStorage.setItem("songHistory", JSON.stringify(newHistory));
  }, [songData]);

  return null;
}
