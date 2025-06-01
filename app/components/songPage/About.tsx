"use client";
import { SongType } from "@/app/types/types";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
// import { fetchSongDetails } from "@/app/utilsFn/fetchSongDetails";
import { useEffect } from "react";
// import instrumentsFilter from "@/app/filters/instruments";

type AboutProps = {
  dominantColor: number[];
  songData: SongType;
};

export default function Genres({ dominantColor, songData }: AboutProps) {
  const artistName = songData.artists[0].name;
  const songName = songData.name;

  useEffect(() => {
    if (!artistName || !songName) return;

    const fetchDetails = async () => {
      // const content = await fetchSongDetails(artistName, songName);
      // if (!content) return;
    };

    fetchDetails();
  }, [artistName, songName]);
  return (
    <div
      className="p-8 rounded-xl row-span-2"
      style={{ backgroundColor: convertToRGB(dominantColor) }}
    >
      <h2 className="text-2xl font-bold">Inspiration</h2>
      <h2 className="text-2xl font-bold mt-8">Instruments</h2>
    </div>
  );
}
