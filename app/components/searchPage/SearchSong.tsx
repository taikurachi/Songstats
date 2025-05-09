import { SongType } from "@/app/types/types";
import getSongLength from "@/app/utilsFn/getSongLength";
import Image from "next/image";
import Link from "next/link";

export default function SearchSong({ song }: { song: SongType }) {
  return (
    <Link href={`/songs/${song.id}`} className="hover:bg-spotify-gray p-2">
      <div className="flex items-center gap-4 w-full">
        <Image
          className="rounded-md"
          src={song.album.images[0].url}
          alt={`${song.name} album image`}
          width={song.album.images[0].width / 14}
          height={song.album.images[0].height / 14}
        />
        <div>
          <p>{song.name}</p>
          <p className="opacity-80">
            {song.artists.map(({ name }) => name).join(", ")}
          </p>
        </div>
        <span className="ml-auto">{getSongLength(song.duration_ms)}</span>
      </div>
    </Link>
  );
}
