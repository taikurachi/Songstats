"use client";
import { useToken } from "@/app/context/tokenContext";
import { SongType } from "@/app/types/types";
import { fetchSongs } from "@/app/utilsFn/fetchSongs";
import { useEffect, useState } from "react";
import Image from "next/image";
export default function Page({ params }: { params: { query: string } }) {
  const [query, setQuery] = useState<string>("");
  const [songs, setSongs] = useState<SongType[]>([]);
  const { token } = useToken();

  useEffect(() => {
    const getParams = async () => {
      try {
        const resolvedParams = await params;
        setQuery(decodeURIComponent(resolvedParams.query));
      } catch {
        setQuery("");
      }
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!token || !query) return;
    const fetchSongData = async () => {
      try {
        const songs = await fetchSongs(query, token as string, 6);
        setSongs(songs);
        console.log(songs);
      } catch {
        setSongs([]);
      }
    };
    fetchSongData();
  }, [query, token]);

  try {
  } catch {}
  return (
    <div className="col-start-2 row-start-2">
      <div className="flex gap-2">
        <div>
          <h3 className="text-2xl font-semibold">Top Result</h3>
          <div className="p-3">
            {songs.length > 0 && (
              <>
                <Image
                  width={songs[0].album.images[2].width}
                  height={songs[0].album.images[2].width}
                  src={songs[0].album.images[2].url}
                  alt={`${songs[0].name} album image`}
                />
                <h4 className="text-3xl font-bold">{songs[0].name}</h4>
                <span>Song</span>
                <span>·</span>
                <span>
                  {songs[0].artists.map(({ name }) => name).join(", ")}
                </span>
              </>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold">Songs</h3>
          {songs.length > 0 &&
            songs
              .slice(1, songs.length)
              .map((song: SongType, index: number) => {
                return <div key={index}>{song.name}</div>;
              })}
        </div>
      </div>
    </div>
  );
}
