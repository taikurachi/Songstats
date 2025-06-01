import { cookies } from "next/headers"; // To access cookies on the server
import Image from "next/image";
import { fetchSongData } from "@/app/utilsFn/fetchSongData";
import { fetchArtistData } from "@/app/utilsFn/fetchArtistData";
import { fetchColor } from "@/app/utilsFn/fetchColor";
import getSongLength from "@/app/utilsFn/getSongLength";
import getColorPalette from "@/app/utilsFn/colorFn/getColorPalette";
import { fetchArtistSongData } from "@/app/utilsFn/fetchArtistSongData";
import { type SongType, type ArtistType, EventType } from "@/app/types/types";
import SongMD from "@/app/components/utils/SongMD";
import { fetchEvents } from "@/app/utilsFn/fetchEvents";
import Event from "@/app/components/songPage/Event";
import LyricsLink from "@/app/components/Links/Lyrics";
import SimilarSongsLink from "@/app/components/Links/SimilarSongs";
import RelatedMediaLink from "@/app/components/Links/RelatedMedia";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";

export default async function SongPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  if (!id) return <div>Song ID is missing. Please check the URL.</div>;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  if (!token) return <div>Token is missing. There has been an error.</div>;
  const songData = await fetchSongData(id, token);
  const artistData = await fetchArtistData(
    songData.artists.map((artist: ArtistType) => artist.id),
    token
  );
  const artistSongData = await fetchArtistSongData(artistData[0].id, token);
  const artistEvents = await fetchEvents(artistData[0].name);
  const { dominantColor } = await fetchColor(songData.album.images[0].url);

  return (
    <div className="col-start-2 row-start-2 overflow-y-auto bg-[#121212] min-h-[calc(100vh-64px)]">
      <main
        style={{
          background: getColorPalette(dominantColor),
        }}
        className="flex gap-10 max-w-[1800px] pl-8 pb-8 pt-12"
      >
        <div className="w-[200px] h-[200px] relative shadow-5xl hover:scale-102">
          <Image
            className="rounded-md"
            src={songData.album.images[0].url}
            alt={`${songData.album.name} album image`}
            layout="fill"
            objectFit="contain"
          />
        </div>
        <div className="flex flex-col justify-end">
          <p className="mb-2">Single</p>
          <h1
            className={`font-extrabold ${
              songData.name.length > 10 ? "text-5xl mb-2" : "text-8xl mb-4"
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
          <div className="flex gap-4 mt-4">
            <LyricsLink
              id={id}
              isrc={songData.external_ids.isrc}
              dominantColor={dominantColor}
              albumName={songData.album.name}
              artistName={artistData[0].name}
              songName={songData.name}
            />
            <div
              style={{ backgroundColor: convertToRGB(dominantColor) }}
              className="flex-1 p-4 h-48 rounded-xl"
            >
              details link
            </div>
            <RelatedMediaLink />
            <SimilarSongsLink />
          </div>
        </div>
        {artistEvents.length > 0 && (
          <div className="mt-20">
            <h3 className="font-bold text-2xl">Events</h3>
            <div className="grid grid-cols-3 ml-[-8px] mt-3">
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
            <div className="flex ml-[-12px] mt-3">
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
