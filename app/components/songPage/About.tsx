"use client";
import { SongType } from "@/app/types/types";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import { fetchSongDetails } from "@/app/utilsFn/fetchSongDetails";
import { useEffect, useState } from "react";
// import instrumentsFilter from "@/app/filters/instruments";

type AboutProps = {
  dominantColor: number[];
  songData: SongType;
};

export default function Genres({ dominantColor, songData }: AboutProps) {
  const artistName = songData.artists[0].name;
  const songName = songData.name;
  const [inspirationDetails, setInspirationDetails] = useState<string[]>([]);
  const [instrumentDetails, setInstrumentDetails] = useState<string>("");

  useEffect(() => {
    if (!artistName || !songName) return;

    const fetchDetails = async () => {
      const content = await fetchSongDetails(artistName, songName);
      const citations: string[] = content.citations;

      if (!content) return;

      const sentences = content.choices[0].message.content
        .split(".")
        .map((s: string) => s.trim())
        .filter(Boolean);

      const instruments = sentences.at(-1);
      // .split(",")
      // .filter((instrument: string) =>
      //   instrumentsFilter.has(instrument.toLowerCase().trim())
      // );

      console.log(instruments);
      setInspirationDetails(sentences.slice(0, 3));
      setInstrumentDetails(instruments);
    };

    fetchDetails();
  }, [artistName, songName]);
  return (
    <div
      className="p-8 rounded-xl row-span-2"
      style={{ backgroundColor: convertToRGB(dominantColor) }}
    >
      <h2 className="text-2xl font-bold">Inspiration</h2>
      <div className="flex flex-col mt-4 gap-4">
        {inspirationDetails.length !== 0 &&
          inspirationDetails.map((s: string, index: number) => (
            <p className="font-medium text-xl" key={index}>
              {s + "."}
            </p>
          ))}
      </div>
      <h2 className="text-2xl font-bold mt-8">Instruments</h2>
      {/* {instrumentDetails.length !== 0 &&
        instrumentDetails.map((instrument: string, index: number) => (
          <span key={index}>{instrument}</span>
        ))} */}
      {instrumentDetails.length !== 0 && <p>{instrumentDetails}</p>}
    </div>
  );
}
