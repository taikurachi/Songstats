import Image from "next/image";
import Link from "next/link";
import truncateText from "@/app/utilsFn/truncateText";
import { SongType } from "@/app/types/types";

type SongMDProps = {
  song: SongType;
};
export default function SongMD({ song }: SongMDProps) {
  return (
    <Link
      href={`/songs/${song.id}`}
      className="p-3 hover:bg-spotify-gray rounded-lg"
    >
      <Image
        className="rounded-lg"
        src={song.imageURL ? song.imageURL : song.album.images[0].url}
        height={160}
        width={160}
        alt={`${song.name} album image`}
      />
      <p className="mt-2">{truncateText(song.name, 5)}</p>
    </Link>
  );
}
