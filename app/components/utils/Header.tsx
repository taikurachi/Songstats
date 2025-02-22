"use client";
import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [searchString, setSearchString] = useState<string>("");
  const [clicked, setClicked] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setClicked(false);
        setSearchString("");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
  const handleClick = () => {
    setClicked((clicked) => !clicked);
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
          animate={{ width: clicked ? "15rem" : "8rem" }}
          transition={{ duration: 0.3, ease: "backOut" }}
          onClick={handleClick}
          ref={ref}
          className="flex items-center gap-4 cursor-pointer transition-[max-width]"
        >
          <Image
            className="invert"
            src="/search-icon.svg"
            width={30}
            height={30}
            alt="search icon"
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            className={`outline-none bg-transparent w-full`}
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
        </motion.div>
      </nav>
    </header>
  );
}
