import { motion } from "motion/react";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef } from "react";
import { useState } from "react";
import { debouncedFetchSongs } from "@/app/utilsFn/fetchSongs";
import { useToken } from "@/app/context/tokenContext";
import Song from "./MainSearchSong";
import Link from "next/link";
import { SongType } from "@/app/types/types";
import { fetchTopSongs } from "@/app/utilsFn/fetchTopSongs";

const defaultSongs = [
  {
    track: {
      name: "BMF",
      id: "3U3hFkMr0Q90pD24EkE3Pr",
    },
  },
  {
    track: {
      name: "Die With a Smile",
      id: "7so0lgd0zP2Sbgs2d7a1SZ",
    },
  },
  {
    track: {
      name: "luther (with sza)",
      id: "45J4avUb9Ni0bnETYaYFVJ",
    },
  },
];

export default function MainSearch() {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [searchString, setSearchString] = useState<string>("");
  const { token } = useToken();
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [topSongs, setTopSongs] = useState<{ track: SongType }[]>([]);
  const [songs, setSongs] = useState<SongType[]>([]);
  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
    setActiveInput(true);
  };
  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget))
      return;

    setActiveInput(false);
    setSearchString("");
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchSongs = async () => {
      try {
        const songs = await fetchTopSongs(token);
        setTopSongs(songs.length !== 0 ? songs : defaultSongs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (searchString.length === 0) {
      setActiveInput(false);
      setSongs([]);
    }
    if (searchString.length !== 0) {
      setActiveInput(true);
      const fetchSongsQuery = async () => {
        const songs = await debouncedFetchSongs(searchString, token);
        setSongs(songs);
      };
      fetchSongsQuery();
    }
  }, [searchString, token]);

  return (
    <main
      className={`h-[calc(100svh-110px)] flex items-center justify-center flex-col mt-[-55px] mx-auto w-min gap-10
     `}
    >
      <motion.h1
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0 } }}
        className={`text-4xl font-bold transition-opacity`}
      >
        Explore Song Data
      </motion.h1>
      <motion.div
        layout
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: activeInput ? 460 : 94, opacity: 1 }}
        exit={{ height: 94, opacity: 0 }}
        transition={{
          height: { type: "spring", stiffness: 120, damping: 20 },
        }}
        className={`rounded-[30px] flex flex-col`}
      >
        <div
          className={`flex gap-3 bg-white pl-10 pr-10 pt-8 pb-8 ${
            activeInput ? "rounded-t-[30px] rounded-b-none" : "rounded-[30px]"
          }`}
        >
          <Image
            className=""
            src="/search-icon.svg"
            width={30}
            height={30}
            alt="search icon"
          />
          <input
            onBlur={handleOnBlur}
            onChange={handleOnChange}
            value={searchString}
            type="text"
            className={`text-black border-none outline-none w-4/5 sm:w-[470px] `}
            placeholder="Search"
          />
        </div>
        {activeInput && (
          <div className="overflow-hidden flex-1 rounded-b-[30px]">
            <div
              ref={dropdownRef}
              className="h-full flex flex-col text-black bg-white pl-6 pr-10 pb-6 overflow-y-scroll"
            >
              {songs.map((song, index) => (
                <Song song={song} index={index} key={index} usage="main" />
              ))}
            </div>
          </div>
        )}
      </motion.div>
      <motion.div
        className="flex max-w-[90vw] md:max-w-[440px] justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, width: "100%" }}
        transition={{
          width: { type: "spring", stiffness: 120, damping: 20 },
          delay: 0.5,
        }}
      >
        Recommended:
        <motion.div className="flex">
          {topSongs.map((song, index) => (
            <motion.div
              key={index}
              className="ml-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: index / 5 + 0.2,
              }}
            >
              <Link
                href={`/songs/${song.track.id}`}
                className="text-[#BBBBBB] hover:text-white transition-colors"
              >
                <p>{song.track.name}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
