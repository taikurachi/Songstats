"use client";

import { useEffect } from "react";

type SessionStorageProviderProps = {
  albumName: string;
  songName: string;
  artistName: string;
};

export default function SessionStorageProvider({
  albumName,
  songName,
  artistName,
}: SessionStorageProviderProps) {
  useEffect(() => {
    const songDetails = {
      albumName,
      songName,
      artistName,
    };

    if (songDetails) {
      sessionStorage.setItem("songDetails", JSON.stringify(songDetails));
    }
  }, [albumName, artistName, songName]);

  return null;
}
