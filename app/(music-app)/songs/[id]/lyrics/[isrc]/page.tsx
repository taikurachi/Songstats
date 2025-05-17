import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import { fetchLyrics } from "@/app/utilsFn/fetchLyrics";
import { cookies } from "next/headers";

export default async function LyricsPage({
  params,
}: {
  params: { isrc: string };
}) {
  const { isrc } = await params;
  const cookieStore = await cookies();
  const dominantColor = cookieStore.get(`bg_color_${isrc}`)?.value || "";
  const lyricsData = await fetchLyrics(isrc);
  const lyrics = lyricsData?.slice(0, lyricsData.indexOf("*", 1));
  const formattedLyrics = lyrics.split("\n");

  return (
    <div className="row-start-2 col-start-2 rounded-xl font-bold text-2xl flex">
      <main
        style={{ backgroundColor: convertToRGB(JSON.parse(dominantColor)) }}
        className="pr-8 pt-8 pl-8 h-full"
      >
        {formattedLyrics.map((line: string, index: number) =>
          line === "" ? (
            <p className="h-6" key={index}></p>
          ) : (
            <p key={index}>{line}</p>
          )
        )}
      </main>
      <div>asd</div>
    </div>
  );
}
