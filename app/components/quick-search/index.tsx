import { useEffect, useState, useRef, ChangeEvent } from "react";
import Icon from "../utils/Icon";
import KeyboardNavigation from "./keyboard-navigation";
import { SongType } from "@/app/types/types";
import Song from "../main-search/MainSearchSong";
import { useToken } from "@/app/context/tokenContext";
import { debouncedFetchSongs } from "@/app/utilsFn/fetchSongs";
import { useRouter } from "next/navigation";
export default function QuickSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [songs, setSongs] = useState<SongType[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const songRefs = useRef<HTMLAnchorElement[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const router = useRouter();

  const { token } = useToken();

  useEffect(() => {
    songRefs.current = songRefs.current.slice(0, songs.length);
    if (songs.length > 0) songRefs.current[0].focus();
  }, [songs]);

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

  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      // if not keyboard nav, return immediately
      if (
        !isSearchOpen ||
        (event.key !== "ArrowUp" &&
          event.key !== "ArrowDown" &&
          !(event.metaKey && event.key === "Enter"))
      )
        return;

      let newIndex: number = 0;
      if (event.key === "ArrowUp") {
        if (selectedIndex === 0) return;
        newIndex = selectedIndex - 1;
      }
      if (event.key === "ArrowDown") {
        if (selectedIndex === songs.length - 1) return;
        newIndex = selectedIndex + 1;
      }

      if (event.metaKey && event.key === "Enter") {
        router.push(`/songs/${songs[selectedIndex].id}`);
        setIsSearchOpen(false);
        setSearchQuery("");
        return;
      }
      setSelectedIndex(newIndex);
      songRefs.current[newIndex]?.focus();
    };
    document.addEventListener("keydown", handleKeyboardNavigation);
    return () =>
      document.removeEventListener("keydown", handleKeyboardNavigation);
  }, [isSearchOpen, selectedIndex, songs, router]);

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
            <div className="flex-1 overflow-hidden pl-4">
              <div
                className="flex flex-col h-full overflow-y-scroll pb-4 custom-scrollbar"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                {songs.length > 0 &&
                  songs.map((song: SongType, index: number) => (
                    <Song
                      ref={(el) => {
                        if (el) songRefs.current[index] = el;
                      }}
                      song={song}
                      index={index}
                      key={index}
                      usage="quick"
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
