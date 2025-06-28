"use client";
import { useEffect, useState, useRef } from "react";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import LyricsAnalysis from "./lyrics-analysis";
import Icon from "../utils/Icon";
import { type SongType } from "@/app/types/types";
import convertToColorArr from "@/app/utilsFn/colorFn/convertToColorArr";
import checkLuminance from "@/app/utilsFn/colorFn/checkLuminance";

const calcHighlightColor = (dominantColor: string) => {
  const dominantColorArr: number[] = convertToColorArr(dominantColor);
  let topChannel = 0; // 0 is red, 1 is green, 2 is blue
  for (let i = 0; i < dominantColorArr.length; i++) {
    topChannel =
      dominantColorArr[i] > dominantColorArr[topChannel] ? i : topChannel;
  }
  const copiedColorProfile = [...dominantColorArr];
  copiedColorProfile[topChannel] += 50;
  if (copiedColorProfile[topChannel] > 255)
    copiedColorProfile[topChannel] = 255;

  return copiedColorProfile;
};

export default function Lyrics({ dominantColor }: { dominantColor: string }) {
  const [songDetails, setSongDetails] = useState<SongType | null>(null);
  const [lyricsFetched, setLyricsFetched] = useState<boolean>(false);
  const [lyricsAnalysis, setLyricsAnalysis] = useState<{
    lyrics_analysis: Record<string, { analysis: string; themes: string }>;
  } | null>(null);
  const [lyrics, setLyrics] = useState<string[]>([]);
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
    const data: string | null = sessionStorage.getItem("songDetails");
    if (!data) return;
    const retriedvedLyrics = JSON.parse(data).lyrics;
    if (!retriedvedLyrics) {
      setLyricsFetched(true);
      return;
    }
    const processedLyrics = retriedvedLyrics
      .slice(0, retriedvedLyrics.indexOf("*", 1))
      .split("\n");
    setLyrics(processedLyrics);
    setLyricsFetched(true);
  }, []);

  const highlightedColor = calcHighlightColor(dominantColor);

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
        className="p-8 h-full flex-1 rounded-lg overflow-y-scroll flex flex-col"
        style={{ background: dominantColor }}
      >
        {!lyricsFetched && <div>Loading...</div>}
        {lyricsFetched && lyrics.length === 0 && (
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
              } ${
                checkLuminance(convertToColorArr(dominantColor))
                  ? "text-white"
                  : "text-black"
              }`}
            >
              {line}
            </p>
          )
        )}
        {lyrics.length > 0 && (
          <div className="flex items-center gap-2 mt-auto">
            <p
              className={`text-sm font-extralight opacity-80 ${
                checkLuminance(convertToColorArr(dominantColor))
                  ? "text-white"
                  : "text-black"
              }`}
            >
              Lyrics provided my Musixmatch
            </p>
            <Icon
              variant="details"
              size={12}
              className={`opacity-80 hover:opacity-100 cursor-pointer ${
                !checkLuminance(convertToColorArr(dominantColor)) && "invert"
              }`}
            />
          </div>
        )}
      </main>
      <div
        ref={containerRef}
        className="flex-1 p-8 overflow-y-scroll h-full bg-spotify-darkGray rounded-lg"
      >
        {lyrics.length > 0 && songDetails ? (
          <LyricsAnalysis
            lyrics={lyrics}
            dominantColor={dominantColor}
            songData={songDetails}
            lyricsAnalysis={lyricsAnalysis}
            setLyricsAnalysis={setLyricsAnalysis}
            highlightedColor={highlightedColor}
            contentRefs={contentRefs}
          />
        ) : (
          <div>No lyrics found just yet.</div>
        )}
      </div>
    </>
  );
}
