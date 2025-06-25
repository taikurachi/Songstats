"use client";
import Icon from "@/app/components/utils/Icon";
import SongSM from "@/app/components/utils/SongSM";
import { SongType } from "@/app/types/types";
import { useEffect, useState } from "react";

export default function SongsDefault() {
  const [songs, setSongs] = useState<SongType[]>([]);

  useEffect(() => {
    const songHistory = localStorage.getItem("songHistory") || "";
    if (!songHistory) return;

    setSongs(JSON.parse(songHistory));
  }, []);
  return (
    <div className="col-start-2 row-start-2 overflow-y-scroll bg-spotify-darkGray rounded-lg mr-2 relative">
      <main
        className="flex gap-6 p-6"
        style={{
          background: "linear-gradient(180deg, #523AA1 0%, #281D50 100%",
        }}
      >
        <div
          className="size-56 flex items-center justify-center rounded-lg shadow-5xl"
          style={{
            background: "linear-gradient(135deg, #4101F5 0%, #C3EDD9 100%",
          }}
        >
          <Icon
            variant="history"
            size={80}
            className="text-white drop-shadow-lg"
          />
        </div>

        {/* Text content */}
        <div className="relative flex flex-col justify-end text-white">
          <p className="text-sm font-medium opacity-90 mb-2">Playlist</p>
          <h1 className="text-6xl md:text-8xl font-black">My History</h1>
          {songs.length > 0 && (
            <p className="text-sm opacity-80 font-medium">
              {songs.length} song{songs.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </main>
      <div
        className="p-4 h-[120px] absolute top-[238px] w-full"
        style={{
          background: "linear-gradient(180deg, #221840 0%, #121212 100%)",
          backdropFilter: "blur(10px)",
        }}
      ></div>
      <div className="relative z-10">
        <div className="border-b border-white py-4 flex border-opacity-40 mx-8 opacity-70 px-4">
          <div className="w-[86px] lg:w-[92px]">#</div>
          <div className="w-2/5">Title</div>
          <div className="w-2/5 hidden lg:block">Album</div>
          <div className="w-1/5 ml-auto">Date analyzed</div>
        </div>
        <div className="flex flex-col mx-8 my-4">
          {songs.length > 0 &&
            songs.map((song: SongType, index: number) => (
              <SongSM song={song} key={index} index={index} />
            ))}
        </div>
      </div>
    </div>
  );
}
