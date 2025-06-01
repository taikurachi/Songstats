"use client";
import setColorCookie from "@/app/actions";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import Link from "next/link";

type LyricsLinkProps = {
  dominantColor: number[];
  isrc: string;
  id: string;
  albumName: string;
  songName: string;
  artistName: string;
};

export default function LyricsLink({
  dominantColor,
  isrc,
  id,
  albumName,
  songName,
  artistName,
}: LyricsLinkProps) {
  const handleClick = () => {
    setColorCookie(dominantColor, id);

    sessionStorage.setItem(
      `songDetails`,
      JSON.stringify({ isrc, albumName, artistName, songName })
    );
  };

  return (
    <Link
      style={{ background: convertToRGB(dominantColor) }}
      onClick={handleClick}
      href={`/songs/${id}/lyrics`}
      className="rounded-xl flex-1 p-4 h-48 text-2xl font-bold"
    >
      Lyrics
    </Link>
  );
}
