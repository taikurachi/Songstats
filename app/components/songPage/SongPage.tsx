"use client";
import Image from "next/image";
import { fetchSongData } from "@/app/utilsFn/fetchSongData";
import { useToken } from "@/app/context/tokenContext";
import { useEffect, useState } from "react";
import Header from "../utils/Header";
import { fetchArtistData } from "@/app/utilsFn/fetchArtistData";
import { fetchLyrics } from "@/app/utilsFn/fetchLyrics";
import { fetchEvents } from "@/app/utilsFn/fetchEvents";
type SongType = {
  album: {
    name: string;
    images: { height: number; width: number; url: string }[];
    release_date: string;
  };
  name: string;
  artists: { id: string; name: string }[];
  id: string;
  popularity: string;
  duration_ms: number;
  external_ids: {
    isrc: string;
  };
};

type ArtistType = {
  genres: string[];
  id: string;
  popularity: number;
  images: { url: string; height: number; width: number }[];
  name: string;
};
export default function SongPage({ id }: { id: string }) {
  const { token } = useToken();
  const [songData, setSongData] = useState<SongType | null>(null);
  const [artistData, setArtistData] = useState<ArtistType[] | null>(null);
  const [lyricsData, setLyricsData] = useState<string | null>(null);
  // const [eventsData, setEventsData] = useState

  useEffect(() => {
    if (!songData?.artists) return;
    (async () => {
      const events = await fetchEvents(songData.artists[0].name);
      console.log(events);
    })();
  }, [songData]);

  useEffect(() => {
    if (!songData?.external_ids.isrc) return;
    (async () => {
      const lyrics = await fetchLyrics(songData.external_ids.isrc);
      setLyricsData(lyrics);
    })();
  }, [songData]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const song = await fetchSongData(id, token);
      setSongData(song);
    })();
  }, [token, id]);

  useEffect(() => {
    if (songData?.artists && token)
      (async () => {
        const artists = await fetchArtistData(
          songData.artists.map((artist) => artist.id),
          token
        );
        setArtistData(artists || null);
      })();
  }, [songData, token]);

  if (!songData) {
    return <div>Loading...</div>;
  }

  const totalSeconds = Math.floor(songData.duration_ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return (
    <>
      <Header />
      <main className="flex gap-10 max-w-[1800px] pr-8 pl-8">
        <Image
          src={songData.album.images[0].url}
          alt={`${songData.album.name} album image`}
          width={200}
          height={200}
        />
        <div>
          <h1 className="font-extrabold text-8xl">{songData.name}</h1>
          <div className="flex items-center gap-2">
            <div className="">
              {artistData?.map((artist, index) => (
                <Image
                  style={{ marginLeft: index * -10 }}
                  className="rounded-full inline-block"
                  src={artist.images[0].url}
                  key={index}
                  width={30}
                  height={30}
                  alt={`${artist.name} image`}
                />
              ))}
            </div>
            <span>·</span>
            <p>{songData.artists.map((artist) => artist.name).join(", ")}</p>
            <span>·</span>
            <p>{songData.album.name}</p>
            <span>·</span>
            <p>{songData.album.release_date.slice(0, 4)}</p>
            <span>·</span>
            <p>{`${minutes}.${seconds < 10 ? "0" + seconds : seconds}`}</p>
          </div>
        </div>
      </main>
      <div>
        {lyricsData ? (
          <p>{lyricsData.slice(0, lyricsData.indexOf("*", 1))}</p>
        ) : (
          <p>No lyrics available.</p>
        )}
      </div>
    </>
  );
}
