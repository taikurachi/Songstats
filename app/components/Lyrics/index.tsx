"use client";
import { useEffect, useState, useRef } from "react";
import { fetchLyrics } from "@/app/utilsFn/fetchLyrics";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import LyricsAnalysis from "./LyricsAnalysis";
import Icon from "../utils/Icon";
import { animate, progress } from "motion";

type SongDetails = {
  songName: string;
  albumName: string;
  isrc: string;
  artistName: string;
};
const calcHighlightColor = (dominantColor: number[]) => {
  let topChannel = 0; // 0 is red, 1 is green, 2 is blue
  for (let i = 0; i < dominantColor.length; i++) {
    topChannel = dominantColor[i] > dominantColor[topChannel] ? i : topChannel;
  }
  const copiedColorProfile = [...dominantColor];
  copiedColorProfile[topChannel] += 50;
  if (copiedColorProfile[topChannel] > 255)
    copiedColorProfile[topChannel] = 255;

  return copiedColorProfile;
};

export default function Lyrics({ dominantColor }: { dominantColor: string }) {
  const [songDetails, setSongDetails] = useState<SongDetails | null>(null);
  const [lyricsAnalysis, setLyricsAnalysis] = useState<{
    lyrics_analysis: Record<string, { analysis: string; themes: string }>;
  } | null>(null);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const contentRefs = useRef({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const wasAnalysisFound = (line: string): boolean => {
    if (!lyricsAnalysis) return false;
    const cleanedLower = line.replace(/["'""'']/g, "");
    const lineLower = cleanedLower.toLowerCase().trim();

    return Object.keys(lyricsAnalysis.lyrics_analysis).some((key: string) => {
      const cleanedKey = key.replace(/["'""'']/g, "");
      const keyLower = cleanedKey.toLowerCase().trim();

      return lineLower.includes(keyLower) || keyLower.includes(lineLower);
    });
  };

  // Initialize song details from sessionStorage
  useEffect(() => {
    const storedDetails = sessionStorage.getItem("songDetails");
    if (storedDetails) {
      setSongDetails(JSON.parse(storedDetails));
    }
  }, []);

  // Fetch lyrics
  useEffect(() => {
    if (!songDetails?.isrc) return;
    const fetchSongsLyrics = async () => {
      const lyricsData = await fetchLyrics(songDetails.isrc);
      if (lyricsData) {
        const processedLyrics = lyricsData
          .slice(0, lyricsData.indexOf("*", 1))
          .split("\n");
        setLyrics(processedLyrics);
      }
      setIsLoading(false);
    };
    fetchSongsLyrics();
  }, [songDetails?.isrc]);
  const parsedDominantColor = JSON.parse(dominantColor);
  const highlightedColor = calcHighlightColor(parsedDominantColor);

  const findElementRef = (line: string) => {
    const cleanedLine = line.toLowerCase().replace(/["'""'']/g, "");

    const elementArr = Object.entries(contentRefs.current).find(
      ([key, element]) => {
        const cleanedKey = key.toLowerCase().replace(/["'""'']/g, "");
        if (
          cleanedKey.includes(cleanedLine) ||
          cleanedLine.includes(cleanedKey)
        )
          return element;
      }
    );
    if (!elementArr) return;
    return elementArr[1];
  };

  const handleLyricClick = async (line: string) => {
    if (!lyricsAnalysis || !contentRefs.current || !containerRef.current)
      return;

    const specifiedElementRef = findElementRef(line);
    if (!specifiedElementRef) return;

    const scrollDistance =
      (specifiedElementRef as HTMLElement).offsetTop -
      containerRef.current.offsetTop;

    const container = containerRef.current;

    container.scrollTo({ top: scrollDistance - 28, behavior: "smooth" });
  };

  return (
    <>
      <main
        className="p-8 h-full flex-1 rounded-lg overflow-y-scroll "
        style={{ background: convertToRGB(parsedDominantColor) }}
      >
        {isLoading && <div>Loading...</div>}
        {!isLoading && lyrics.length === 0 && (
          <div>No lyrics found just yet.</div>
        )}

        {lyrics.map((line: string, index: number) =>
          line === "" ? (
            <p className="h-6" key={index}></p>
          ) : (
            <p
              key={index}
              onClick={() => handleLyricClick(line)}
              style={{
                backgroundColor: `${
                  lyricsAnalysis &&
                  wasAnalysisFound(line) &&
                  convertToRGB(highlightedColor)
                }`,
              }}
              className={`w-fit ${
                lyricsAnalysis && wasAnalysisFound(line) && "cursor-pointer"
              }`}
            >
              {line}
            </p>
          )
        )}
        {lyrics.length > 0 && (
          <div className="flex items-center gap-2">
            <p className="text-sm font-extralight opacity-80">
              Lyrics provided my Musixmatch
            </p>
            <Icon
              variant="details"
              size={12}
              className="opacity-80 hover:opacity-100 cursor-pointer"
            />
          </div>
        )}
      </main>
      <div
        ref={containerRef}
        className="flex-1 p-8 overflow-y-scroll h-full bg-spotify-darkGray rounded-lg"
      >
        {lyrics.length > 0 && songDetails && (
          <LyricsAnalysis
            lyrics={lyrics}
            songDetails={songDetails}
            lyricsAnalysis={lyricsAnalysis}
            setLyricsAnalysis={setLyricsAnalysis}
            highlightedColor={highlightedColor}
            contentRefs={contentRefs}
          />
        )}
      </div>
    </>
  );
}
