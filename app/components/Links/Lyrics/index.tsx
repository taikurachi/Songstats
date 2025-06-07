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

export default function LyricsLink({ dominantColor, id }: LyricsLinkProps) {
  return (
    <Link
      style={{ background: convertToRGB(dominantColor) }}
      href={`/songs/${id}/lyrics`}
      className="rounded-xl flex-1 p-4 h-48 text-xl font-bold"
    >
      Lyrics
    </Link>
  );
}
