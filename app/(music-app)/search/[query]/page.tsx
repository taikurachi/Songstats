"use client";
import { useToken } from "@/app/context/tokenContext";
import { SongType } from "@/app/types/types";
import { fetchSongs } from "@/app/utilsFn/fetchSongs";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import SearchSong from "@/app/components/searchPage/SearchSong";
import { fetchFeaturedSongs } from "@/app/utilsFn/fetchFeaturedSongs";
import truncateText from "@/app/utilsFn/truncateText";
import Link from "next/link";
export default function Page({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const [songs, setSongs] = useState<SongType[]>([]);
  const [featuredSongs, setFeaturedSongs] = useState<
    { name: string; imageURL: string; id: string }[]
  >([]);
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
      const featuredSongs: { name: string; imageURL: string; id: string }[] =
        await fetchFeaturedSongs(songs[0].artists[0].id, token);
      setFeaturedSongs(featuredSongs);
    };
    fetchFeatured();
  }, [songs, token]);

  return (
    <div className="col-start-2 row-start-2 p-8">
      <div className="flex-col sm:flex-row flex gap-2">
        {songs.length > 0 && (
          <div className="flex-1">
            <h3 className="text-2xl font-semibold">Top Result</h3>
            <div className="p-5 rounded-lg bg-spotify-gray mt-2 ">
              <Image
                className="rounded-lg"
                width={songs[0].album.images[0].width / 7}
                height={songs[0].album.images[0].width / 7}
                src={songs[0].album.images[0].url}
                alt={`${songs[0].name} album image`}
              />
              <h4 className="text-3xl font-bold mt-6">{songs[0].name}</h4>
              <span className="opacity-80">Song</span>
              <span>·</span>
              <span>{songs[0].artists.map(({ name }) => name).join(", ")}</span>
            </div>
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
        <div>
          <h3 className="text-2xl font-semibold">
            Featuring {songs[0].artists[0].name}
          </h3>
          <div className="flex gap-2 mt-2">
            {featuredSongs.map(
              (
                song: { name: string; imageURL: string; id: string },
                index: number
              ) => (
                <Link href={`/songs/${song.id}`} key={index}>
                  <Image
                    src={song.imageURL}
                    height={160}
                    width={160}
                    alt={`${song.name} album image`}
                  />
                  <div key={index}>{truncateText(song.name, 15)}</div>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
