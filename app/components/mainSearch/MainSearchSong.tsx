import { SongType } from "@/app/types/types";
import Image from "next/image";
import { motion } from "motion/react";
import Link from "next/link";
import truncateText from "@/app/utilsFn/truncateText";

type SongProps = {
  song: SongType;
  index: number;
  usage: "main" | "quick";
};

export default function MainSearchSong({ song, usage, index }: SongProps) {
  return (
    <Link href={`songs/${song.id}`} className="w-full">
      <motion.div
        className="flex gap-4 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 100 }}
        transition={{ delay: index / 30 }}
      >
        <Image
          className="rounded-sm"
          src={song.album.images[0].url}
          alt={`${song.album.name} album image`}
          width={50}
          height={50}
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
