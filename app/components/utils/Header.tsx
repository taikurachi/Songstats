"use client";
import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useToken } from "@/app/context/tokenContext";
import { fetchSongs } from "@/app/utilsFn/fetchSongs";
import { SongType } from "@/app/types/types";
import SongSM from "./SongSM";
export default function Header() {
  const [searchString, setSearchString] = useState<string>("");
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [songs, setSongs] = useState<SongType[]>([]);
  const { token } = useToken();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    if (searchString.length === 0) {
      setActiveInput(false);
      setSongs([]);
    }
    if (searchString.length !== 0) {
      setActiveInput(true);
      (async () => {
        const songs = await fetchSongs(searchString, token);
        setSongs(songs);
      })();
    }
  }, [searchString, token]);

  const handleClick = () => {
    inputRef.current?.focus();
  };
  return (
    <header className="p-8 h-[110px] flex items-center">
      <nav className="flex justify-between w-full max-w-[1800px] mx-auto">
        <Link href="/">
          <Image
            src="/spotify-logo.svg"
            width={130}
            height={80}
            alt="spotify logo"
          />
        </Link>
        <motion.div
          initial={{ width: "8rem" }}
          animate={{ width: activeInput ? "20rem" : "8rem" }}
          transition={{ duration: 0.3, ease: "backOut" }}
          onClick={handleClick}
          className="cursor-pointer transition-[max-width]"
        >
          <div className="flex items-center gap-4">
            <Image
              className="invert"
              src="/search-icon.svg"
              width={30}
              height={30}
              alt="search icon"
            />
            <input
              ref={inputRef}
              // onBlur={() => {
              //   setSearchString("");
              //   setSongs([]);
              //   setActiveInput(false);
              // }}
              onFocus={() => setActiveInput(true)}
              type="text"
              placeholder="Search"
              className={`outline-none bg-transparent w-full`}
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
          </div>
          {songs.length !== 0 && (
            <div className="absolute bg-slate-900 rounded-lg p-4 flex flex-col items-start gap-2 mt-4">
              {songs.map((song, index) => (
                <SongSM song={song} index={index} key={index} />
              ))}
            </div>
          )}
        </motion.div>
      </nav>
    </header>
  );
}
