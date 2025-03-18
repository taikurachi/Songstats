import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import { fetchLyrics } from "@/app/utilsFn/fetchLyrics";

type LyricsProps = {
  songData: {
    external_ids: {
      isrc: string;
    };
  };
  dominantColor: number[];
};
export default async function Lyrics({ songData, dominantColor }: LyricsProps) {
  if (!songData || !songData.external_ids.isrc) {
    return <div>No song data available.</div>;
  }
  try {
    const lyricsData = await fetchLyrics(songData.external_ids.isrc);
    const lyrics = lyricsData?.slice(0, lyricsData.indexOf("*", 1));
    const formattedLyrics = lyrics.split("\n");

    return (
      <div
        style={{ backgroundColor: convertToRGB(dominantColor) }}
        className="rounded-xl font-bold text-2xl overflow-hidden pb-8 row-span-2"
      >
        {lyricsData ? (
          <div className="overflow-scroll h-[500px] pr-8 pt-8 pl-8">
            {formattedLyrics.map((line: string, index: number) =>
              line === "" ? (
                <p className="h-6" key={index}></p>
              ) : (
                <p key={index}>{line}</p>
              )
            )}
          </div>
        ) : (
          <p>No lyrics available.</p>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return <div>Failed to load lyrics. Please try again later.</div>;
  }
}
