import { useEffect, useState, useRef, ChangeEvent } from "react";
import Icon from "./Icon";
import KeyboardNavigation from "./KeyboardNavigation";
import { SongType } from "@/app/types/types";
import Song from "../mainSearch/Song";
import { useToken } from "@/app/context/tokenContext";
import { debouncedFetchSongs, fetchSongs } from "@/app/utilsFn/fetchSongs";
export default function QuickSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [songs, setSongs] = useState<SongType[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { token } = useToken();
  useEffect(() => {
    if (!token) return;
    if (searchQuery === "") {
      setSongs([]);
      setIsTyping(false);
      return;
    }

    if (searchQuery !== "") {
      setIsTyping(true);
      const fetchSongsQuery = async () => {
        const songs = await debouncedFetchSongs(searchQuery, token);
        setSongs(songs);
      };
      fetchSongsQuery();
    }
  }, [searchQuery, token]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (event.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) inputRef.current.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isSearchOpen) return;

      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);

  return (
    isSearchOpen && (
      <div className="fixed top-0 left-0 w-screen h-[100svh] bg-black bg-opacity-50 z-40 flex justify-center items-center">
        <div
          ref={modalRef}
          className="z-50 w-1/2 flex flex-col items-center justify-center "
        >
          <div
            className={`bg-spotify-gray ${
              isTyping ? "rounded-t-lg" : "rounded-lg"
            } w-full p-4`}
          >
            <div className="rounded-[30px] bg-white p-4 flex gap-3">
              <Icon variant="search" size={24} />
              <input
                ref={inputRef}
                className="text-black w-full bg-transparent border-none outline-none font-light"
                placeholder="What do you want to analyze?"
                onChange={handleOnChange}
                value={searchQuery}
              />
            </div>
          </div>
          <div
            className={`w-full bg-spotify-gray h-[600px] flex flex-col ${
              isTyping ? "opacity-100" : "opacity-0"
            }`}
          >
            <KeyboardNavigation isTyping={isTyping} />
            <div className="flex-1 mt-4 overflow-hidden pl-8">
              <div className="flex flex-col h-full gap-2 overflow-scroll py-4">
                {songs.length > 0 &&
                  songs.map((song: SongType, index: number) => (
                    <Song song={song} index={index} key={index} usage="quick" />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
