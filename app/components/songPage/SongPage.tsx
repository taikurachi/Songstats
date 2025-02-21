"use client";
import Image from "next/image";
import { fetchSongData } from "@/app/utilsFn/fetchSongData";
import { useToken } from "@/app/context/tokenContext";
import { useEffect, useState } from "react";
type SongType = {
  album: {
    name: string;
    images: { height: number; width: number; url: string }[];
  };
  name: string;
  artists: { name: string }[];
  id: string;
};

export default function SongPage({ id }: { id: string }) {
  const { token } = useToken();
  const [songData, setSongData] = useState<SongType | null>(null);
  console.log(songData);
  useEffect(() => {
    if (!token) return;
    (async () => {
      const song = await fetchSongData(id, token);
      setSongData(song);
    })();
  }, [token, id]);
  if (!songData) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>{songData.name}</h1>
      <p>Album: {songData.album.name}</p>
      <p>Artists: {songData.artists.map((artist) => artist.name).join(", ")}</p>
      <Image
        src={songData.album.images[2].url}
        alt={`${songData.album.name} album image`}
        width={300}
        height={300}
      />
    </div>
  );
}
