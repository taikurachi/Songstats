"use client";

import { SongType } from "@/app/types/types";
import { useEffect, useState } from "react";
import Image from "next/image";
import getSongLength from "@/app/utilsFn/getSongLength";

export default function Details({ dominantColor }: { dominantColor: string }) {
  const [songDetails, setSongDetails] = useState<SongType | null>(null);

  useEffect(() => {
    const storedDetails = sessionStorage.getItem("songDetails");
    if (storedDetails) setSongDetails(JSON.parse(storedDetails));
  }, []);

  // Early return if no data
  if (!songDetails) {
    return (
      <div className="p-8 w-full mr-2 rounded-lg bg-spotify-darkGray">
        <div>Loading...</div>
      </div>
    );
  }

  // Constants after we know songDetails exists
  const titleClass =
    songDetails.name.length > 10 ? "text-4xl mb-2" : "text-5xl mb-4";
  const releaseYear = songDetails.album.release_date.slice(0, 4);
  const songLength = getSongLength(songDetails.duration_ms);
  const artistNames = songDetails.artists
    .map((artist) => artist.name)
    .join("  ·  ");

  return (
    <div className="p-8 w-full mr-2 rounded-lg bg-spotify-darkGray">
      <main className="flex gap-6 items-end">
        <div className="size-20 relative shadow-5xl hover:scale-102">
          <Image
            className="rounded-md"
            src={songDetails.album.images[0].url}
            alt={`${songDetails.album.name} album image`}
            fill
            priority
          />
        </div>
        <div className="flex flex-col justify-end">
          <h1 className={`font-extrabold ${titleClass}`}>{songDetails.name}</h1>
          <div className="flex items-center gap-2 text-[14px] font-extralight">
            <p className="font-medium">{artistNames}</p>
            <span className="opacity-80">·</span>
            <p className="opacity-80">{songDetails.album.name}</p>
            <span className="opacity-80">·</span>
            <p className="opacity-80">{releaseYear}</p>
            <span className="opacity-80">·</span>
            <p className="opacity-80">{songLength}</p>
          </div>
        </div>
      </main>
      <div className="flex gap-3 mt-14 h-[184px]">
        <div
          style={{ background: dominantColor }}
          className="p-6 flex flex-col rounded-lg flex-1"
        >
          <div className="flex justify-between">
            <h4>Total Streams</h4>
            {/* <span className="text-center flex items-center text-green-700 p-1 bg-transparent text-sm">
              + 10.1%
            </span> */}
          </div>
          <p className="opacity-70">Quantity</p>
          <p className="font-black text-5xl mt-auto">123,000,000</p>
        </div>
        <div
          style={{ background: dominantColor }}
          className="p-6 flex flex-1 rounded-lg"
        >
          <div className="flex flex-col flex-1 border-r border-white border-opacity-40">
            <h4>Song Score</h4>
            <p className="opacity-70">Quality</p>
            <div className="mt-auto font-black text-5xl w-fit inline">
              90<span className="font-medium text-lg opacity-70"> / 100 </span>
            </div>
          </div>
          <div className="flex flex-col justify-between flex-1 items-end">
            <div className="w-[120px]">
              <span>{songDetails.popularity}</span>
              <span className="opacity-70 text-lg ml-2 hover:underline">
                Popularity
              </span>
            </div>
            <div className="w-[120px]">
              <span>{songDetails.popularity}</span>
              <span className="opacity-70 text-lg ml-2 hover:underline">
                Popularity
              </span>
            </div>
            <div className="w-[120px]">
              <span>90</span>
              <span className="opacity-70 text-lg ml-2 hover:underline">
                Longevity
              </span>
            </div>
            <div className="w-[120px]">
              <span>90</span>
              <span className="opacity-70 text-lg ml-2 hover:underline">
                Lyrics
              </span>
            </div>
          </div>
        </div>
        <div
          style={{ background: dominantColor }}
          className="p-6 flex flex-col flex-1 rounded-lg"
        >
          <h4>Most Streamed Country</h4>
          <p className="opacity-70">Global</p>
          <div className="mt-auto flex gap-4">
            <Image src={"/us-flag.svg"} width={70} alt="us-flag" height={40} />
            <div>
              <p className="font-extralight text-sm">North America</p>
              <p className="text-lg">United States</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">Chart data</div>
    </div>
  );
}
