"use client";

import { useEffect } from "react";

type SessionStorageProviderProps = {
  albumName: string;
  songName: string;
  artistName: string;
  isrc: string;
};

export default function SessionStorageProvider({
  albumName,
  songName,
  artistName,
  isrc,
}: SessionStorageProviderProps) {
  useEffect(() => {
    const songDetails = {
      albumName,
      songName,
      artistName,
      isrc,
    };

    if (songDetails) {
      sessionStorage.setItem("songDetails", JSON.stringify(songDetails));
    }
  }, [albumName, artistName, songName, isrc]);

  return null;
}
