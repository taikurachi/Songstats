"use client";
import setColorCookie from "@/app/actions";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import Link from "next/link";

type LyricsLinkProps = {
  dominantColor: number[];
  isrc: string;
  id: string;
};

export default function LyricsLink({
  dominantColor,
  isrc,
  id,
}: LyricsLinkProps) {
  const handleClick = () => setColorCookie(dominantColor, isrc);
  //   console.log(getColorPalette(dominantColor));
  return (
    <Link
      style={{ background: convertToRGB(dominantColor) }}
      onClick={handleClick}
      href={`/songs/${id}/lyrics/${isrc}`}
      className="rounded-xl flex-1 p-4 h-48 text-2xl font-bold"
    >
      Lyrics
    </Link>
  );
}
