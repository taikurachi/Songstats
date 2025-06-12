import { cookies } from "next/headers"; // To access cookies on the server
import Image from "next/image";
import { fetchSongData } from "@/app/utilsFn/fetchSongData";
import { fetchArtistData } from "@/app/utilsFn/fetchArtistData";
import { fetchColor } from "@/app/utilsFn/fetchColor";
import getSongLength from "@/app/utilsFn/getSongLength";
import getColorPalette from "@/app/utilsFn/colorFn/getColorPalette";
import { type ArtistType } from "@/app/types/types";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import Icon from "@/app/components/utils/Icon";
import Link from "next/link";
import Events from "@/app/components/songPage/Events";
import MoreBy from "@/app/components/songPage/MoreBy";
import SessionStorageProvider from "@/app/components/utils/SessionStorageProvider";
import CookieSetter from "@/app/components/utils/CookieSetter";
import checkLuminance from "@/app/utilsFn/colorFn/checkLuminance";
import LocalStorageProvider from "@/app/components/utils/LocalStorageProvider";

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
  const { dominantColorArr }: { dominantColorArr: number[] } = await fetchColor(
    songData.album.images[0].url
  );
  const dominantColorRGB: string = convertToRGB(dominantColorArr);
  return (
    <div className="col-start-2 row-start-2 overflow-y-auto bg-[#121212] min-h-[calc(100vh-64px)] rounded-lg">
      <LocalStorageProvider songData={songData} />
      <SessionStorageProvider
        albumName={songData.album.name}
        songName={songData.name}
        artistName={songData.artists[0].name}
        isrc={songData.external_ids.isrc}
      />
      <CookieSetter dominantColor={dominantColorRGB} id={id} />
      <main
        style={{
          background: getColorPalette(dominantColorRGB),
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
      <div
        className="p-8"
        style={{
          background: `linear-gradient(to bottom, ${dominantColorRGB}, transparent 16%, transparent 100%)`,
        }}
      >
        <div className="flex gap-6">
          <Link
            href={songData.external_urls.spotify}
            className="bg-spotify-green rounded-full w-[68px] h-[68px] flex justify-center items-center hover:scale-102 cursor-pointer "
          >
            <Icon variant="play" size={22} className="ml-1" />
          </Link>
          <Icon
            variant="save"
            size={25}
            className="invert opacity-80 hover:opacity-100 hover:scale-102 cursor-pointer"
          />
        </div>
        <div className="mt-10">
          <h3 className="font-bold text-2xl">Analyze</h3>
          <div className="flex gap-4 mt-4">
            {Object.entries({
              lyrics: "Lyrics",
              related: "Related Media",
              details: "Details",
            }).map(([key, value], index: number) => (
              <Link
                key={index}
                style={{ background: dominantColorRGB }}
                href={`/songs/${id}/${key}`}
                className={`rounded-xl flex-1 p-4 h-52 text-xl font-bold ${
                  checkLuminance(dominantColorArr) ? "text-white" : "text-black"
                }`}
              >
                {value}
              </Link>
            ))}
          </div>
        </div>
        <Events songData={songData} />
        <MoreBy songData={songData} />
      </div>
    </div>
  );
}
