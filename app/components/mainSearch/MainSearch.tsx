import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { ChangeEvent, useEffect } from "react";
import { useState } from "react";
type MainSearchProps = {
  searchString: string;
  setSearchString: (value: string | ((prev: string) => string)) => void;
};
export default function MainSearch({
  searchString,
  setSearchString,
}: MainSearchProps) {
  const [activeInput, setActiveInput] = useState<boolean>(false);
  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
    setActiveInput(true);
  };
  useEffect(() => {
    setActiveInput(searchString === "" ? false : true);
  }, [searchString]);
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
        initial={{ height: 0 }}
        animate={{ height: 500 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={`bg-green-500 rounded-[30px]`}
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
            onChange={handleOnChange}
            value={searchString}
            type="text"
            className={`text-black border-none outline-none w-4/5 sm:w-[400px] `}
            placeholder="Search"
          />
        </div>
        {activeInput && (
          <div className="h-[400px] pl-10 pr-10 pt-8 pb-8 rounded-b-[30px]">
            hi
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
