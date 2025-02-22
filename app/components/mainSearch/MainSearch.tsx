import { motion } from "motion/react";
import Image from "next/image";
import { ChangeEvent, useEffect } from "react";
import { useState } from "react";
import { fetchSongs } from "@/app/utilsFn/fetchSongs";
import { useToken } from "@/app/context/tokenContext";
import Song from "./Song";
type MainSearchProps = {
  searchString: string;
  setSearchString: (value: string | ((prev: string) => string)) => void;
};

export default function MainSearch({
  searchString,
  setSearchString,
}: MainSearchProps) {
  const { token } = useToken();
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const [songs, setSongs] = useState([]);
  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
    setActiveInput(true);
  };

  useEffect(() => {
    if (!token) return;
    if (searchString.length === 0) setSongs([]);
    if (searchString.length !== 0) {
      (async () => {
        const songs = await fetchSongs(searchString, token);
        setSongs(songs);
      })();
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
            onFocus={() => setActiveInput(true)}
            // onBlur={() => setActiveInput(false)}
            onChange={handleOnChange}
            value={searchString}
            type="text"
            className={`text-black border-none outline-none w-4/5 sm:w-[400px] `}
            placeholder="Search"
          />
        </div>
        {activeInput && (
          <div className="overflow-hidden flex-1 rounded-b-[30px]">
            <div className="h-full flex flex-col gap-2 text-black bg-white pl-10 pr-10 pb-6 overflow-y-scroll">
              {songs.map((song, index) => (
                <Song song={song} index={index} key={index} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={``}
      >
        Recommended: <span className="ml-4">Sienna</span>{" "}
        <span className="ml-4">Die For You</span>{" "}
        <span className="ml-4">Blessed</span>
      </motion.p>
    </main>
  );
}
