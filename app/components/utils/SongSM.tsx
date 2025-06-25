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
        <div>
          <p className="font-medium text-lg">{song.name}</p>
          <p>{song.artists.map((artist) => artist.name).join(", ")}</p>
        </div>
      </div>
    </Link>
  );
}
