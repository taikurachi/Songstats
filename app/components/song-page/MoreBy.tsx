"use client";
import { SongType } from "@/app/types/types";
import { useEffect, useState } from "react";
import SongMD from "../utils/SongMD";
import { fetchArtistSongData } from "@/app/utilsFn/fetchArtistSongData";
import { useToken } from "@/app/context/tokenContext";
import { motion } from "motion/react";

export default function MoreBy({ songData }: { songData: SongType }) {
  const [artistSongData, setArtistSongData] = useState([]);
  const [artistIndex, setArtistIndex] = useState(0);
  const { token } = useToken();

  const handleArtistSwitch = () =>
    setArtistIndex((prev) => (prev + 1) % songData.artists.length);

  useEffect(() => {
    if (!token) return;
    const fetchMoreByData = async () => {
      const artistSongData = await fetchArtistSongData(
        songData.artists[artistIndex].id,
        token
      );
      setArtistSongData(artistSongData);
    };
    fetchMoreByData();
  }, [token, artistIndex, songData]);
  return (
    artistSongData.length > 0 && (
      <div className="mt-20">
        <div className="flex justify-between">
          <h3 className="font-bold text-2xl">
            More by{" "}
            <motion.span
              key={artistIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {songData.artists[artistIndex] &&
                songData.artists[artistIndex].name}
            </motion.span>
          </h3>
          {songData.artists.length > 1 && (
            <span
              className="hover:underline cursor-pointer"
              onClick={handleArtistSwitch}
            >
              Switch artist
            </span>
          )}
        </div>
        <div className="flex ml-[-12px] mt-3">
          {artistSongData.map((song: SongType, index: number) => (
            <SongMD song={song} key={index} />
          ))}
        </div>
      </div>
    )
  );
}
