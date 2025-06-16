import { cookies } from "next/headers";
import Image from "next/image";
import { fetchSongData } from "@/app/utilsFn/fetchSongData";
import { fetchColor } from "@/app/utilsFn/fetchColor";
import getSongLength from "@/app/utilsFn/getSongLength";
import getColorPalette from "@/app/utilsFn/colorFn/getColorPalette";
import { SongType } from "@/app/types/types";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import Icon from "@/app/components/utils/Icon";
import Link from "next/link";
import Events from "@/app/components/songPage/Events";
import MoreBy from "@/app/components/songPage/MoreBy";
import SessionStorageProvider from "@/app/components/providers/SessionStorageProvider";
import CookieSetter from "@/app/components/utils/CookieSetter";
import checkLuminance from "@/app/utilsFn/colorFn/checkLuminance";
import LocalStorageProvider from "@/app/components/providers/LocalStorageProvider";
import ArtistProfiles from "@/app/components/artist-profiles";
import { Suspense } from "react";

// 🚀 OPTIMIZATION 1: Parallel Data Fetching
async function getPageData(id: string, token: string) {
  try {
    const songData = await fetchSongData(id, token);

    if (!songData?.album?.images?.[0]?.url) {
      throw new Error("Song not found or no album image");
    }

    const colorData = await fetchColor(songData.album.images[0].url);

    return {
      songData,
      dominantColorArr: colorData.dominantColorArr,
      dominantColorRGB: convertToRGB(colorData.dominantColorArr),
    };
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
}

// 🚀 OPTIMIZATION 2: Memoized Components
function SongHeader({
  songData,
  dominantColorRGB,
}: {
  songData: SongType;
  dominantColorRGB: string;
}) {
  // Pre-calculate values to avoid re-computation
  const titleClass =
    songData.name.length > 10 ? "text-5xl mb-2" : "text-8xl mb-4";
  const releaseYear = songData.album.release_date.slice(0, 4);
  const songLength = getSongLength(songData.duration_ms);
  const artistNames = songData.artists
    .map((artist) => artist.name)
    .join("  ·  ");

  return (
    <main
      style={{ background: getColorPalette(dominantColorRGB) }}
      className="flex gap-10 max-w-[1800px] pl-8 pb-8 pt-12"
    >
      <div className="w-[200px] h-[200px] relative shadow-5xl hover:scale-102">
        <Image
          className="rounded-md"
          src={songData.album.images[0].url}
          alt={`${songData.album.name} album image`}
          fill
          sizes="200px"
          priority // Load this image first
        />
      </div>
      <div className="flex flex-col justify-end">
        <p className="mb-2">Single</p>
        <h1 className={`font-extrabold ${titleClass}`}>{songData.name}</h1>
        <div className="flex items-center gap-2">
          <Suspense
            fallback={
              <div className="w-[90px] h-[30px] bg-gray-600 rounded-full animate-pulse" />
            }
          >
            <ArtistProfiles songData={songData} />
          </Suspense>
          <span>·</span>
          <p className="font-medium">{artistNames}</p>
          <span className="opacity-80">·</span>
          <p className="opacity-80">{songData.album.name}</p>
          <span className="opacity-80">·</span>
          <p className="opacity-80">{releaseYear}</p>
          <span className="opacity-80">·</span>
          <p className="opacity-80">{songLength}</p>
        </div>
      </div>
    </main>
  );
}

// 🚀 OPTIMIZATION 3: Lazy Loading for Heavy Components
function LazyContent({
  songData,
  dominantColorRGB,
  dominantColorArr,
  id,
}: {
  songData: SongType;
  dominantColorRGB: string;
  dominantColorArr: number[];
  id: string;
}) {
  const textColor = checkLuminance(dominantColorArr)
    ? "text-white"
    : "text-black";

  return (
    <div
      className="p-8"
      style={{
        background: `linear-gradient(to bottom, ${dominantColorRGB}, transparent 16%, transparent 100%)`,
      }}
    >
      <div className="flex gap-6">
        <Link
          href={songData.external_urls.spotify}
          className="bg-spotify-green rounded-full w-[68px] h-[68px] flex justify-center items-center hover:scale-102 cursor-pointer"
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
          {[
            { key: "lyrics", value: "Lyrics" },
            { key: "related", value: "Related Media" },
            { key: "details", value: "Details" },
          ].map(({ key, value }) => (
            <Link
              key={key} // Use key instead of index for better performance
              style={{ background: dominantColorRGB }}
              href={`/songs/${id}/${key}`}
              className={`rounded-xl flex-1 p-4 h-52 text-xl font-bold ${textColor}`}
            >
              {value}
            </Link>
          ))}
        </div>
      </div>

      {/* Lazy load heavy components */}
      <Suspense
        fallback={
          <div className="mt-20 h-32 bg-gray-800 rounded animate-pulse" />
        }
      >
        <Events songData={songData} />
      </Suspense>

      <Suspense
        fallback={
          <div className="mt-20 h-32 bg-gray-800 rounded animate-pulse" />
        }
      >
        <MoreBy songData={songData} />
      </Suspense>
    </div>
  );
}

export default async function SongPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Early returns for better performance
  if (!id) {
    return <div>Song ID is missing. Please check the URL.</div>;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  if (!token) {
    return <div>Token is missing. There has been an error.</div>;
  }

  // 🚀 OPTIMIZATION 4: Parallel data fetching
  const pageData = await getPageData(id, token);

  if (!pageData) {
    return <div>Failed to load song data. Please try again.</div>;
  }

  const { songData, dominantColorArr, dominantColorRGB } = pageData;

  return (
    <div className="col-start-2 row-start-2 overflow-y-auto bg-[#121212] min-h-[calc(100vh-64px)] rounded-lg">
      {/* Providers load instantly */}
      <LocalStorageProvider songData={songData} />
      <SessionStorageProvider
        albumName={songData.album.name}
        songName={songData.name}
        artistName={songData.artists[0].name}
        isrc={songData.external_ids.isrc}
      />
      <CookieSetter dominantColor={dominantColorRGB} id={id} />

      {/* Header loads immediately */}
      <SongHeader songData={songData} dominantColorRGB={dominantColorRGB} />

      {/* Heavy content loads progressively */}
      <LazyContent
        songData={songData}
        dominantColorRGB={dominantColorRGB}
        dominantColorArr={dominantColorArr}
        id={id}
      />
    </div>
  );
}
