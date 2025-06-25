import { SongType } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";

type SongSMProps = {
  song: SongType;
  index: number;
};

export default function SongSM({ song, index }: SongSMProps) {
  return (
    <Link href={`/songs/${song.id}`}>
      <div className="flex gap-4 justify-start items-center w-full hover:bg-spotify-lightGray py-2 px-4 rounded-md">
        <span className="w-5">{index + 1}</span>
        <Image
          src={song.album.images[2].url}
          alt={`${song.album.name} album image`}
          width={40}
          height={40}
        />
        <div className="w-2/5">
          <p className="font-extralight text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            {song.name}
          </p>
          <p className="opacity-70">
            {song.artists.map((artist) => artist.name).join(", ")}
          </p>
        </div>
        <p className="w-2/5 opacity-70 lg:block hidden">{song.album.name}</p>
        <p className="w-1/5 opacity-70 ml-auto">
          {song.analyzedDate || "No date found"}
        </p>
      </div>
    </Link>
  );
}
