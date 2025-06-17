import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import { fetchLyricsDetails } from "@/app/utilsFn/fetchLyricsDetails";
import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  RefObject,
} from "react";
import { motion } from "motion/react";
import Icon from "../../utils/Icon";
import convertToColorArr from "@/app/utilsFn/colorFn/convertToColorArr";
import checkLuminance from "@/app/utilsFn/colorFn/checkLuminance";
import { SongType } from "@/app/types/types";
type AnalysisData = {
  lyrics_analysis: Record<string, { analysis: string; themes: string }>;
};
type LyricsAnalysisProps = {
  lyrics: string[];
  dominantColor: string;
  songData: SongType;
  lyricsAnalysis: AnalysisData | null;
  setLyricsAnalysis: Dispatch<SetStateAction<AnalysisData | null>>;
  highlightedColor: number[];
  contentRefs: RefObject<Record<string, HTMLElement | null>>;
};
export default function LyricsAnalysis({
  songData,
  dominantColor,
  lyrics,
  lyricsAnalysis,
  setLyricsAnalysis,
  highlightedColor,
  contentRefs,
}: LyricsAnalysisProps) {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!lyrics || lyrics.length === 0 || !loading || lyricsAnalysis) return;

    const fetchLyricsAnalysis = async () => {
      try {
        const data = await fetchLyricsDetails(
          songData.artists[0].name,
          songData.name,
          songData.album.name,
          lyrics.join("")
        );
        setLyricsAnalysis(data);
        setLoading(false);
      } catch {
        return;
      }
    };

    fetchLyricsAnalysis();
  }, [lyrics, loading, lyricsAnalysis, songData, setLyricsAnalysis]);

  return (
    <>
      {loading && <div>Loading...</div>}
      {lyricsAnalysis && (
        <div>
          {Object.entries(lyricsAnalysis.lyrics_analysis).map(
            ([line, { analysis, themes }], index) => (
              <div
                className="mb-44"
                ref={(el) => void (contentRefs.current[line] = el)}
                key={index}
              >
                <p
                  style={{ background: `${convertToRGB(highlightedColor)}` }}
                  className={`mb-8 w-fit ${
                    checkLuminance(convertToColorArr(dominantColor))
                      ? "text-white"
                      : "text-black"
                  }`}
                >
                  {line}
                </p>
                <hr className="opacity-40 mb-6" />
                {analysis
                  .split(".")
                  .filter((line: string) => line)
                  .map((line: string, index: number) => (
                    <p key={index} className="mb-6">
                      {line + "."}
                    </p>
                  ))}
                <div className="opacity-80 font-extralight text-sm flex gap-2">
                  <p>Themes:</p>
                  <p>{themes.toLowerCase()}</p>
                </div>
              </div>
            )
          )}
          <div className="flex gap-2 items-center">
            <p className="text-sm font-extralight opacity-80">
              Analysis provided by Perplexity
            </p>
            <motion.span>
              <Icon variant="perplexity" size={10} className="opacity-80" />
            </motion.span>
          </div>
        </div>
      )}
    </>
  );
}
