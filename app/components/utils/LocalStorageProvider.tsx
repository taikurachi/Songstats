"use client";
import { SongType } from "@/app/types/types";
import { useEffect } from "react";

// const checkIfSongType = (data) => typeof data === SongType;
export default function LocalStorageProvider({
  songData,
}: {
  songData: SongType;
}) {
  useEffect(() => {
    if (!songData) return;
    const currentHistory = localStorage.getItem("songHistory");

    // Store first song
    if (!currentHistory) {
      localStorage.setItem("songHistory", JSON.stringify([songData]));
      return;
    }

    const newHistory = JSON.parse(currentHistory);

    // check if song is already in local storage
    // if not, add new songData to newHistory
    if (newHistory.every((song: SongType) => song.id !== songData.id)) {
      newHistory.unshift(songData);
    }

    localStorage.setItem("songHistory", JSON.stringify(newHistory));
  }, [songData]);
  return null;
}
