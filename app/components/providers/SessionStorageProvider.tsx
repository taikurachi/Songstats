"use client";

import { SongType } from "@/app/types/types";
import { useEffect } from "react";

type SessionStorageProviderProps = {
  songData: SongType;
};

export default function SessionStorageProvider({
  songData,
}: SessionStorageProviderProps) {
  useEffect(() => {
    if (songData) {
      sessionStorage.setItem("songDetails", JSON.stringify(songData));
    }
  }, [songData]);

  return null;
}
