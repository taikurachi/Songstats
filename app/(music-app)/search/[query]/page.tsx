"use client";
import { useToken } from "@/app/context/tokenContext";
import { SongType } from "@/app/types/types";
import { fetchSongs } from "@/app/utilsFn/fetchSongs";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import SearchSong from "@/app/components/search-page";
import { fetchFeaturedSongs } from "@/app/utilsFn/fetchFeaturedSongs";
import SongMD from "@/app/components/utils/SongMD";
import Link from "next/link";
export default function Page({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const [songs, setSongs] = useState<SongType[]>([]);
  const [featuredSongs, setFeaturedSongs] = useState<SongType[]>([]);
  const { token } = useToken();
  const resolvedParams = use(params);
  const decodedQuery = decodeURIComponent(resolvedParams.query);

  useEffect(() => {
    if (!token || !decodedQuery) return;
    const fetchSongData = async () => {
      try {
        const songs = await fetchSongs(decodedQuery, token as string, 5);

        setSongs(songs.length > 4 ? songs.slice(0, 4) : songs);
      } catch {
        setSongs([]);
      }
    };
    fetchSongData();
  }, [decodedQuery, token]);

  useEffect(() => {
    if (!token || songs.length <= 0) return;
    const fetchFeatured = async () => {
      const featuredSongs = await fetchFeaturedSongs(
        songs[0].artists[0].id,
        token
      );
      setFeaturedSongs(featuredSongs);
    };
    fetchFeatured();
  }, [songs, token]);

  return (
    <div className="col-start-2 row-start-2 p-8">
      <div className="flex-col sm:flex-row flex gap-2">
        {songs.length > 0 && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-2xl font-semibold">Top Result</h3>
            <Link href={`/songs/${songs[0].id}`}>
              <div className="p-5 rounded-lg bg-spotify-darkGray hover:bg-spotify-gray mt-2 flex-1">
                <Image
                  className="rounded-lg shadow-2xl"
                  width={songs[0].album.images[0].width / 7}
                  height={songs[0].album.images[0].width / 7}
                  src={songs[0].album.images[0].url}
                  alt={`${songs[0].name} album image`}
                />
                <h4 className="text-3xl font-bold mt-6">{songs[0].name}</h4>
                <div className="mt-1">
                  <span className="opacity-80">Song</span>
                  <span className="mx-2">·</span>
                  <span>
                    {songs[0].artists.map(({ name }) => name).join(", ")}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {songs.length > 0 && (
          <div className="flex-1 lg:flex-[1.5_1_auto]">
            <h3 className="text-2xl font-bold">Songs</h3>
            <div className="flex flex-col mt-2">
              {songs.map((song: SongType, index: number) => (
                <SearchSong song={song} key={index} />
              ))}
            </div>
          </div>
        )}
      </div>
      {featuredSongs.length > 0 && (
        <div className="mt-4">
          <h3 className="text-2xl font-semibold">
            Featuring {songs[0].artists[0].name}
          </h3>
          <div className="flex mt-2 ml-[-12px]">
            {featuredSongs.map((song: SongType, index: number) => (
              <SongMD song={song} key={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
