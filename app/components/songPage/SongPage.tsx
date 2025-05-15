import { cookies } from "next/headers"; // To access cookies on the server
import Image from "next/image";
import { fetchSongData } from "@/app/utilsFn/fetchSongData";
import { fetchArtistData } from "@/app/utilsFn/fetchArtistData";
import { fetchColor } from "@/app/utilsFn/fetchColor";
import getSongLength from "@/app/utilsFn/getSongLength";
import getColorPalette from "@/app/utilsFn/colorFn/getColorPalette";
import { fetchArtistSongData } from "@/app/utilsFn/fetchArtistSongData";
import { type SongType, type ArtistType, EventType } from "@/app/types/types";
import SongMD from "../utils/SongMD";
import { fetchEvents } from "@/app/utilsFn/fetchEvents";
import Event from "./Event";

export default async function SongPage({ id }: { id: string }) {
  if (!id) return <div>Song ID is missing. Please check the URL.</div>;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  if (!token) return <div>Token is missing. There has been an error.</div>;
  const songData = await fetchSongData(id, token);
  const artistData = await fetchArtistData(
    songData.artists.map((artist: ArtistType) => artist.id),
    token
  );
  const artistSongData =
    artistData && artistData.length > 0
      ? await fetchArtistSongData(artistData[0].id, token)
      : null;
  const artistEvents =
    artistData && artistData.length > 0
      ? await fetchEvents(artistData[0].name)
      : null;
  console.log(artistEvents);
  const { dominantColor } = await fetchColor(songData.album.images[0].url);

  return (
    <div className="col-start-2 row-start-2 overflow-y-auto bg-[#121212] min-h-[calc(100vh-64px)]">
      <main
        style={{
          background: getColorPalette(dominantColor),
        }}
        className="flex gap-10 max-w-[1800px] p-8"
      >
        <div className="w-[140px] h-[140px] relative shadow-2xl">
          <Image
            className="rounded-sm"
            src={songData.album.images[0].url}
            alt={`${songData.album.name} album image`}
            layout="fill"
            objectFit="contain"
          />
        </div>
        <div className="flex flex-col justify-end">
          <p className="mb-2">Single</p>
          <h1
            className={`font-extrabold mb-3 ${
              songData.name.length > 10 ? "text-5xl" : "text-8xl"
            }`}
          >
            {songData.name}
          </h1>
          <div className="flex items-center gap-2">
            <div
              className="flex"
              style={{
                marginRight: artistData?.length
                  ? (artistData.length - 1) * -10
                  : 0,
              }}
            >
              {artistData?.map((artist, index) => (
                <div key={index} className="w-[30px] h-[30px] relative">
                  <Image
                    style={{ marginLeft: index * -10 }}
                    className="rounded-full inline-block"
                    src={artist.images[0].url}
                    layout="fill"
                    objectFit="contain"
                    alt={`${artist.name} image`}
                  />
                </div>
              ))}
            </div>
            <span>·</span>
            <p className="font-medium">
              {songData.artists
                .map((artist: ArtistType) => artist.name)
                .join("  ·  ")}
            </p>
            <span className="opacity-80">·</span>
            <p className="opacity-80">{songData.album.name}</p>
            <span className="opacity-80">·</span>
            <p className="opacity-80">
              {songData.album.release_date.slice(0, 4)}
            </p>
            <span className="opacity-80">·</span>
            <p className="opacity-80">{getSongLength(songData.duration_ms)}</p>
          </div>
        </div>
      </main>
      <div className="p-8">
        <div>
          <h3 className="font-bold text-2xl">Analyze</h3>
          <div>
            <div>lyrics</div>
            <div>details</div>
            <div>similar songs</div>
            <div>related media</div>
          </div>
        </div>
        {artistEvents.length > 0 && (
          <div className="mt-20">
            <h3 className="font-bold text-2xl">Events</h3>
            <div className="grid grid-cols-3 ml-[-8px]">
              {artistEvents.map((event: EventType, index: number) => (
                <Event eventData={event} key={index} />
              ))}
            </div>
          </div>
        )}
        {artistSongData.length > 0 && (
          <div className="mt-20">
            <h3 className="font-bold text-2xl">
              More by {artistData && artistData[0].name}
            </h3>
            <div className="flex ml-[-12px]">
              {artistSongData.map((song: SongType, index: number) => (
                <SongMD song={song} key={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
