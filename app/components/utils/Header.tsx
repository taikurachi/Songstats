"use client";
import { useRef, useEffect, useState, ChangeEvent } from "react";
// import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useToken } from "@/app/context/tokenContext";
import { fetchSongs } from "@/app/utilsFn/fetchSongs";
import { SongType } from "@/app/types/types";
import SongSM from "./SongSM";
import Icon from "./Icon";
import QuickSearch from "./QuickSearch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
export default function Header() {
  const [searchString, setSearchString] = useState<string>("");
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [songs, setSongs] = useState<SongType[]>([]);
  const { token } = useToken();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if the path matches the pattern /search/something
    if (pathname.startsWith("/search/")) {
      const query = decodeURIComponent(pathname.replace("/search/", ""));
      setSearchString(query);
    }
    setIsInitialized(true);
  }, [pathname]);

  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      if (searchString.trim()) {
        router.push(`/search/${encodeURIComponent(searchString)}`);
      } else {
        router.push("/search");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchString, isInitialized, router]);

  // useEffect(() => {
  //   if (inputRef.current && activeInput) inputRef.current.focus();
  // }, [activeInput]);

  // useEffect(() => {
  //   if (!token) return;
  //   if (searchString.length === 0) {
  //     setActiveInput(false);
  //     setSongs([]);
  //   } else {
  //     setActiveInput(true);
  //     const fetchSongData = async () => {
  //       const songs = await fetchSongs(searchString, token);
  //       setSongs(songs);
  //     };
  //     fetchSongData();
  //   }
  // }, [searchString, token]);

  const handleClick = () => inputRef.current?.focus();

  const handleOnChange = async (e: ChangeEvent<HTMLInputElement>) =>
    setSearchString(e.target.value);

  return (
    <header className="fixed top-0 h-16 bg-black z-40 flex justify-between items-center px-8 w-full">
      <QuickSearch />
      <div className="flex justify-between w-full max-w-[1800px] mx-auto items-center">
        <Link href="/">
          <Image
            src="/spotify-logo.svg"
            width={130}
            height={80}
            alt="spotify logo"
          />
        </Link>
        <div className="relative">
          <div
            className={`flex items-center gap-4 relative group bg-spotify-gray hover:bg-spotify-lightGray ${
              activeInput ? "outline-white outline" : "outline-gray-600"
            } hover:outline transition-colors duration-300 pl-4 pr-4 pt-[10px] pb-[10px] rounded-[30px]`}
            onClick={handleClick}
          >
            <div className="flex gap-4 items-center">
              <Icon
                variant="search"
                size={24}
                className="invert group-hover:opacity-100 opacity-80 transition-opacity"
              />

              <input
                ref={inputRef}
                onBlur={() => {
                  // setSearchString("");
                  // setSongs([]);
                  setActiveInput(false);
                }}
                onFocus={() => setActiveInput(true)}
                type="text"
                placeholder="What do you want to analyze?"
                className={`outline-none bg-transparent w-[226px]`}
                value={searchString}
                onChange={handleOnChange}
              />
              <div className="group-hover:opacity-80 opacity-0 transition-opacity duration-300">
                <span className="border border-gray-300 p-1 pr-2 pl-2 rounded-md">
                  ⌘
                </span>
                <span className="border border-gray-300 ml-[6px] p-1 pr-2 pl-2 rounded-md">
                  K
                </span>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <span className="w-[1px] block h-8 bg-white opacity-80"></span>
              <Icon
                variant="home"
                size={20}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
          {songs.length !== 0 && (
            <div className="absolute bg-slate-900 rounded-lg p-4 flex flex-col items-start gap-2 mt-[1px] w-full">
              {songs.map((song, index) => (
                <SongSM song={song} index={index} key={index} />
              ))}
            </div>
          )}
        </div>

        <Link
          href="/"
          className="flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity"
        >
          <Icon variant="download" size={20} />
          <p>Get Spotify</p>
        </Link>
      </div>
    </header>
  );
}
