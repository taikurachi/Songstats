import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import { fetchLyricsDetails } from "@/app/utilsFn/fetchLyricsDetails";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
type AnalysisData = {
  literary_devices: string[];
  lyrics_analysis: Record<string, string>;
  overall_themes: string[];
};
type LyricsAnalysisProps = {
  lyrics: string[];
  songDetails: {
    artistName: string;
    songName: string;
    albumName: string;
  };
  lyricsAnalysis: AnalysisData | null;
  setLyricsAnalysis: Dispatch<SetStateAction<AnalysisData | null>>;
  highlightedColor: number[];
};
export default function LyricsAnalysis({
  songDetails,
  lyrics,
  lyricsAnalysis,
  setLyricsAnalysis,
  highlightedColor,
}: LyricsAnalysisProps) {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!lyrics || lyrics.length === 0 || !loading || lyricsAnalysis) return;

    const fetchLyricsAnalysis = async () => {
      try {
        const data = await fetchLyricsDetails(
          songDetails.artistName,
          songDetails.songName,
          songDetails.albumName,
          lyrics.join("")
        );
        setLyricsAnalysis(data);
        setLoading(false);
      } catch {
        return;
      }
    };

    fetchLyricsAnalysis();
  }, [lyrics, loading, lyricsAnalysis, songDetails, setLyricsAnalysis]);

  return (
    <div className="flex-1 p-8 overflow-y-scroll h-full bg-spotify-darkGray rounded-lg">
      {loading && <div>Loading...</div>}
      {lyricsAnalysis && (
        <div>
          {Object.entries(lyricsAnalysis.lyrics_analysis).map(
            ([line, analysis], index) => (
              <div className="mb-20" key={index}>
                <p
                  style={{ background: `${convertToRGB(highlightedColor)}` }}
                  className="mb-6 w-fit"
                >
                  {line}
                </p>
                <p>{analysis}</p>
              </div>
            )
          )}
          {lyricsAnalysis.literary_devices.map(
            (device: string, index: number) => (
              <p key={index}>{device}</p>
            )
          )}
          {lyricsAnalysis.overall_themes.map((theme: string, index: number) => (
            <p key={index}>{theme}</p>
          ))}
        </div>
      )}
    </div>
  );
}
