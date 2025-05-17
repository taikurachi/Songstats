"use client";
import { useRef, useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "./Icon";
import QuickSearch from "../QuickSearch";
import { useRouter } from "next/navigation";
export default function Header() {
  const [searchString, setSearchString] = useState<string>("");
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => setActiveInput(searchString.length !== 0), [searchString]);
  useEffect(() => {
    if (!activeInput) return;
    router.push(
      `/search${
        searchString.trim() ? "/" + encodeURIComponent(searchString) : ""
      }`
    );
  }, [searchString, activeInput, router]);

  const handleClick = () => inputRef.current?.focus();

  const handleOnChange = async (e: ChangeEvent<HTMLInputElement>) =>
    setSearchString(e.target.value);

  return (
    <header className="sticky top-0 bg-black z-40 flex justify-between items-center px-8 w-full col-span-2">
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
                // onFocus={() => setActiveInput(true)}
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
