import Image from "next/image";
import Link from "next/link";
const truncateText = (text: string, length: number): string =>
  text.length > length ? text.slice(0, length) + "..." : text;

type SongProps = {
  song: {
    album: {
      name: string;
      images: { height: number; width: number; url: string }[];
    };
    name: string;
    artists: { name: string }[];
    id: string;
  };
  index: number;
};

export default function Song({ song, index }: SongProps) {
  return (
    <Link href={`songs/${song.id}`}>
      <div className="flex gap-4 justify-center items-center">
        <span className="w-5">{index + 1}</span>
        <Image
          src={song.album.images[2].url}
          alt={`${song.album.name} album image`}
          width={50}
          height={50}
        />
        <div>
          <p className="">{truncateText(song.name, 15)}</p>
          <p>
            {truncateText(
              song.artists.map((artist) => artist.name).join(", "),
              15
            )}
          </p>
        </div>
        <p className="ml-auto">{truncateText(song.album.name, 15)}</p>
      </div>
    </Link>
  );
}
