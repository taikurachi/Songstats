import { SongType } from "@/app/types/types";
import Image from "next/image";
import { motion } from "motion/react";
import Link from "next/link";
import truncateText from "@/app/utilsFn/truncateText";
import { ForwardedRef } from "react";

type SongProps = {
  song: SongType;
  index: number;
  usage: "main" | "quick";
  ref?: ForwardedRef<HTMLAnchorElement>;
};

export default function Song({ song, usage, index, ref }: SongProps) {
  return (
    <Link
      ref={ref}
      href={`/songs/${song.id}`}
      className={`w-full ${
        usage === "quick"
          ? "hover:bg-spotify-lightGray focus:bg-spotify-lightGray"
          : "hover:bg-spotify-extraLightGray focus:bg-spotify-extraLightGray"
      } p-4 rounded-lg focus:outline-none`}
    >
      <motion.div
        className="flex gap-4 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 100 }}
        transition={{ delay: index / 30 }}
      >
        <Image
          className="rounded-lg shadow-2xl"
          src={song.album.images[0].url}
          alt={`${song.album.name} album image`}
          width={usage === "quick" ? 40 : 50}
          height={usage === "quick" ? 40 : 50}
        />
        <div>
          <p className="font-regular text-lg">{song.name}</p>
          <p className="opacity-80">
            {truncateText(
              song.artists.map((artist) => artist.name).join(", "),
              usage === "main" ? 24 : 0
            )}
          </p>
        </div>
        {usage === "main" ? (
          <span className="ml-auto">
            {truncateText(song.album.name, usage === "main" ? 15 : 0)}
          </span>
        ) : (
          <span className="ml-auto mr-8 px-[10px] py-[4px] text-sm text-white text-opacity-60 bg-spotify-lightGray rounded-md font-regular">
            Track
          </span>
        )}
      </motion.div>
    </Link>
  );
}
