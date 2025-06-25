"use client";

import "flag-icons/css/flag-icons.min.css";
import { SongType } from "@/app/types/types";
import { useEffect, useState } from "react";
import Image from "next/image";
import getSongLength from "@/app/utilsFn/getSongLength";
import { fetchLyricsScore } from "@/app/utilsFn/fetchLyricsScore";
import checkLuminance from "@/app/utilsFn/colorFn/checkLuminance";
import convertToColorArr from "@/app/utilsFn/colorFn/convertToColorArr";
import { fetchKworbCountry } from "@/app/utilsFn/fetchKworbCountry";
import {
  countryCodeMap,
  getCountryName,
  getCountryRegion,
} from "@/app/const/countries";
import {
  fetchExternalStreamCountData,
  checkScraperApiHealth,
} from "@/app/utilsFn/fetchExternalScraperData";

// Type for MyStreamCount data
type MyStreamCountData = {
  track_id: string;
  track_info: {
    title: string;
    artist: string;
    total_streams: number;
    release_date: string;
    artwork_url: string;
    album_name: string;
  };
  chart_data: {
    chart_data: {
      [date: string]: {
        total: number;
        daily: number;
      };
    } | null;
  };
  related_tracks: Array<{
    title: string;
    artist: string;
    track_id: string;
  }>;
  success: boolean;
};

type ChartDataPoint = {
  date: string;
  total: number;
  daily: number;
};

type TimePeriod = "1M" | "3M" | "6M" | "YTD" | "All";

const calculateLongevityScore = (
  streamCountData: MyStreamCountData
): string => {
  console.log(streamCountData, "stream count data");
  if (!streamCountData) return "50";

  // Check if chart data exists and has data
  if (
    !streamCountData.chart_data?.chart_data ||
    Object.keys(streamCountData.chart_data.chart_data).length === 0
  ) {
    console.log("No chart data available, returning default score");
    return "50"; // Default score when no chart data
  }

  const chartData = streamCountData.chart_data.chart_data;
  const releaseDate = streamCountData.track_info.release_date
    ? new Date(streamCountData.track_info.release_date)
    : new Date();
  const now = new Date();

  // Convert chart data to array and sort by date
  const dataPoints = Object.entries(chartData)
    .map(([date, values]) => ({
      date: new Date(date),
      total: values?.total || 0,
      daily: values?.daily || 0,
    }))
    .filter((point) => point.total > 0 || point.daily > 0) // Filter out empty data points
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (dataPoints.length < 7) return "50"; // Not enough data

  // Calculate song age in months
  const ageInMonths = Math.max(
    1,
    (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // 1. Age Factor (0-25 points): Older songs with streams get bonus
  let ageScore = 0;
  if (ageInMonths >= 24) ageScore = 25; // 2+ years
  else if (ageInMonths >= 12) ageScore = 20; // 1+ years
  else if (ageInMonths >= 6) ageScore = 15; // 6+ months
  else if (ageInMonths >= 3) ageScore = 10; // 3+ months
  else ageScore = 5; // New songs get some points

  // 2. Stream Consistency (0-30 points): Less variation = better longevity
  const dailyStreams = dataPoints.map((d) => d.daily);
  const avgDaily =
    dailyStreams.reduce((sum, val) => sum + val, 0) / dailyStreams.length;
  const variance =
    dailyStreams.reduce((sum, val) => sum + Math.pow(val - avgDaily, 2), 0) /
    dailyStreams.length;
  const coefficientOfVariation = Math.sqrt(variance) / avgDaily;

  let consistencyScore = 0;
  if (coefficientOfVariation <= 0.3) consistencyScore = 30; // Very consistent
  else if (coefficientOfVariation <= 0.5)
    consistencyScore = 25; // Quite consistent
  else if (coefficientOfVariation <= 0.8)
    consistencyScore = 20; // Moderately consistent
  else if (coefficientOfVariation <= 1.2)
    consistencyScore = 15; // Somewhat inconsistent
  else consistencyScore = 10; // Very inconsistent

  // 3. Decay Rate Analysis (0-25 points): Slower decay = better longevity
  let decayScore = 0;
  if (dataPoints.length >= 30) {
    const firstQuarter = dataPoints.slice(0, Math.floor(dataPoints.length / 4));
    const lastQuarter = dataPoints.slice(-Math.floor(dataPoints.length / 4));

    const firstAvg =
      firstQuarter.reduce((sum, d) => sum + d.daily, 0) / firstQuarter.length;
    const lastAvg =
      lastQuarter.reduce((sum, d) => sum + d.daily, 0) / lastQuarter.length;
    const retentionRate = lastAvg / firstAvg;

    if (retentionRate >= 0.8) decayScore = 25; // Minimal decay
    else if (retentionRate >= 0.6) decayScore = 20; // Slow decay
    else if (retentionRate >= 0.4) decayScore = 15; // Moderate decay
    else if (retentionRate >= 0.2) decayScore = 10; // Fast decay
    else decayScore = 5; // Very fast decay
  } else {
    decayScore = 15; // Default for newer songs
  }

  // 4. Current Performance vs Peak (0-20 points): Maintaining relevance
  const peakDaily = Math.max(...dailyStreams);
  const recentAvg =
    dailyStreams.slice(-7).reduce((sum, val) => sum + val, 0) / 7;
  const currentVsPeak = recentAvg / peakDaily;

  let currentScore = 0;
  if (currentVsPeak >= 0.5) currentScore = 20; // Still at 50%+ of peak
  else if (currentVsPeak >= 0.3) currentScore = 15; // 30-50% of peak
  else if (currentVsPeak >= 0.15) currentScore = 10; // 15-30% of peak
  else if (currentVsPeak >= 0.05) currentScore = 5; // 5-15% of peak
  else currentScore = 0; // Below 5% of peak

  // add special case for extremely popular songs
  if (streamCountData.track_info.total_streams > 1000000000) currentScore = 30;

  const totalScore = Math.min(
    100,
    Math.round(ageScore + consistencyScore + decayScore + currentScore)
  );
  return totalScore.toString();
};

const calculateLyricsScore = async (lyrics: string): Promise<string> => {
  const { score } = await fetchLyricsScore(lyrics);
  return score;
};

export default function Details({ dominantColor }: { dominantColor: string }) {
  const [songDetails, setSongDetails] = useState<SongType | null>(null);
  const [streamCountData, setStreamCountData] =
    useState<MyStreamCountData | null>(null);
  const [isLoadingStreamData, setIsLoadingStreamData] = useState(false);
  const [hoveredLegend, setHoveredLegend] = useState<"daily" | "total" | null>(
    null
  );
  const [streamDataError, setStreamDataError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("All");
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    data: ChartDataPoint;
    x: number;
    y: number;
  } | null>(null);
  const [songScore, setSongScore] = useState<null | {
    popularity: string;
    longevity: string;
    lyrics: string;
  }>(null);

  const [topStreamsByCountry, setTopStreamsByCountry] = useState<string | null>(
    null
  );

  useEffect(() => {
    const storedDetails = sessionStorage.getItem("songDetails");
    if (storedDetails) {
      const parsedDetails = JSON.parse(storedDetails);
      console.log("Loaded songDetails from sessionStorage:", parsedDetails);
      console.log("Song ID:", parsedDetails?.id);
      setSongDetails(parsedDetails);
    }
  }, []);

  useEffect(() => {
    if (!songDetails?.id) {
      console.log("No songDetails or songDetails.id available:", songDetails);
      return;
    }

    const getTopCountryByStreams = async () => {
      try {
        console.log("about to fetch with id", songDetails.id);
        const result = await fetchKworbCountry(songDetails.id);
        console.log("Kworb result:", result);
        setTopStreamsByCountry(
          result.topStreamsByCountry?.toLowerCase() || "us"
        );
      } catch (error) {
        console.error("Error fetching top country:", error);
        setTopStreamsByCountry("us"); // fallback to US
      }
    };
    getTopCountryByStreams();
  }, [songDetails]);

  useEffect(() => {
    if (!streamCountData || !songDetails) return;

    const getSongScore = async () => {
      const popularity: string = songDetails.popularity;
      const longevity: string = calculateLongevityScore(streamCountData);
      const lyrics: string = await calculateLyricsScore(songDetails.lyrics); // Placeholder - lyrics not available

      setSongScore({
        popularity,
        longevity,
        lyrics,
      });
    };

    getSongScore();
  }, [streamCountData, songDetails]);

  // Fetch MyStreamCount data when songDetails is available
  useEffect(() => {
    if (!songDetails?.id) return;

    const fetchStreamData = async () => {
      setIsLoadingStreamData(true);
      setStreamDataError(null);

      try {
        console.log(`🚀 Fetching stream data for track: ${songDetails.id}`);

        // First check if the scraper API is healthy
        const isHealthy = await checkScraperApiHealth();
        if (!isHealthy) {
          console.warn("⚠️ Scraper API not healthy, trying anyway...");
        }

        // Use the Lambda scraper API
        const data = await fetchExternalStreamCountData(songDetails.id, 45000); // 45 second timeout

        if (data && data.track_info) {
          console.log("✅ Lambda scraper data received:", data);

          // Transform the data to match the expected format
          const transformedData: MyStreamCountData = {
            track_id: data.track_id,
            track_info: {
              title: data.track_info.title || songDetails.name,
              artist: data.track_info.artist || songDetails.artists[0]?.name,
              total_streams: data.track_info.total_streams || 0,
              release_date:
                data.track_info.release_date || songDetails.album.release_date,
              artwork_url:
                data.track_info.artwork_url || songDetails.album.images[0]?.url,
              album_name: data.track_info.album_name || songDetails.album.name,
            },
            chart_data: {
              chart_data: data.chart_data?.chart_data || null,
            },
            related_tracks: (data.related_tracks || []).map((track) => ({
              title: track.title || "",
              artist: track.artist || "",
              track_id: track.url?.split("/").pop() || "", // Extract track ID from URL
            })),
            success: true,
          };

          setStreamCountData(transformedData);
        } else {
          console.error("❌ No data received from Lambda scraper");
          setStreamDataError("No stream data available");
        }
      } catch (error) {
        console.error("❌ Error fetching stream data from Lambda:", error);
        setStreamDataError("Failed to fetch stream data from external scraper");
      } finally {
        setIsLoadingStreamData(false);
      }
    };

    fetchStreamData();
  }, [songDetails]);

  // Early return if no data
  if (!songDetails) {
    return (
      <div className="p-8 w-full mr-2 rounded-lg bg-spotify-darkGray">
        <div>Loading...</div>
      </div>
    );
  }

  // Constants after we know songDetails exists

  const titleClass =
    songDetails.name.length > 10 ? "text-4xl mb-2" : "text-5xl mb-4";
  const releaseYear = songDetails.album.release_date.slice(0, 4);
  const songLength = getSongLength(songDetails.duration_ms);
  const artistNames = songDetails.artists
    .map((artist) => artist.name)
    .join("  ·  ");

  // Process chart data for visualization
  const getChartData = (): ChartDataPoint[] => {
    if (!streamCountData?.chart_data?.chart_data) return [];

    const data = streamCountData.chart_data.chart_data;
    return Object.entries(data)
      .map(([date, values]) => ({
        date,
        total: values.total,
        daily: values.daily,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Filter data based on selected time period
  const getFilteredData = (data: ChartDataPoint[]): ChartDataPoint[] => {
    if (!data.length) return [];

    const now = new Date();
    const cutoffDate = new Date();

    switch (selectedPeriod) {
      case "1M":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "6M":
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "YTD":
        cutoffDate.setMonth(0, 1); // January 1st of current year
        break;
      case "All":
      default:
        return data;
    }

    return data.filter((point) => new Date(point.date) >= cutoffDate);
  };

  // Format numbers for Y-axis
  const formatChartNumber = (num: number): string => {
    if (num >= 1000000) {
      return Math.round(num / 1000000) + "M";
    } else if (num >= 1000) {
      return Math.round(num / 1000) + "K";
    }
    return num.toString();
  };

  // Get Y-axis scale for total streams
  const getTotalYAxisScale = (data: ChartDataPoint[]): [number, number] => {
    if (!data.length) return [0, 100000];

    const maxTotal = Math.max(...data.map((d) => d.total));
    const scale = Math.pow(10, Math.floor(Math.log10(maxTotal)));
    const scaledMax = Math.ceil(maxTotal / scale) * scale;

    return [0, scaledMax];
  };

  // Get Y-axis scale for daily streams
  const getDailyYAxisScale = (data: ChartDataPoint[]): [number, number] => {
    if (!data.length) return [0, 10000];

    const maxDaily = Math.max(...data.map((d) => d.daily));
    const scale = Math.pow(10, Math.floor(Math.log10(maxDaily)));
    const scaledMax = Math.ceil(maxDaily / scale) * scale;

    return [0, scaledMax];
  };

  // Generate chart points for SVG
  const generateChartPath = (
    data: ChartDataPoint[],
    field: "total" | "daily",
    yScale: [number, number],
    width: number
  ) => {
    if (!data.length) return "";

    const height = 200;
    const [minY, maxY] = yScale;

    const points = data.map((point, index) => {
      // Handle single data point case
      const x = data.length === 1 ? 0 : (index / (data.length - 1)) * width;
      const y = height - ((point[field] - minY) / (maxY - minY)) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  const chartData = getChartData();
  const filteredData = getFilteredData(chartData);
  const totalYScale = getTotalYAxisScale(filteredData);
  const dailyYScale = getDailyYAxisScale(filteredData);

  return (
    <div className="p-8 w-full mr-2 rounded-lg bg-spotify-darkGray flex flex-col">
      <main className="flex gap-6 items-end">
        <div className="size-20 relative shadow-5xl hover:scale-102">
          <Image
            className="rounded-md"
            src={songDetails.album.images[0].url}
            alt={`${songDetails.album.name} album image`}
            fill
            priority
          />
        </div>
        <div className="flex flex-col justify-end">
          <h1 className={`font-extrabold ${titleClass}`}>{songDetails.name}</h1>
          <div className="flex items-center gap-2 text-[14px] font-extralight">
            <p className="font-medium">{artistNames}</p>
            <span className="opacity-80">·</span>
            <p className="opacity-80">{songDetails.album.name}</p>
            <span className="opacity-80">·</span>
            <p className="opacity-80">{releaseYear}</p>
            <span className="opacity-80">·</span>
            <p className="opacity-80">{songLength}</p>
          </div>
        </div>
      </main>
      <div
        className={`flex gap-3 mt-14 h-[184px] ${
          checkLuminance(convertToColorArr(dominantColor))
            ? "text-white"
            : "text-black"
        }`}
      >
        <div
          style={{ background: dominantColor }}
          className="p-6 flex flex-col rounded-lg flex-1"
        >
          <h4>Total Streams</h4>

          <p className="opacity-70">Quantity</p>
          {streamCountData ? (
            <p className="font-extrabold text-4xl mt-auto">
              {streamCountData.track_info.total_streams.toLocaleString()}
            </p>
          ) : (
            <div className="mt-auto w-56 h-8 bg-white bg-opacity-20 rounded animate-pulse"></div>
          )}
        </div>
        <div
          style={{ background: dominantColor }}
          className="p-6 flex flex-1 rounded-lg"
        >
          <div
            className={`flex flex-col flex-1 border-r ${
              checkLuminance(convertToColorArr(dominantColor))
                ? "border-white"
                : "border-black"
            } border-opacity-40`}
          >
            <h4>Song Score</h4>
            <p className="opacity-70">Quality</p>
            {songScore ? (
              <div className="mt-auto font-extrabold text-4xl w-fit inline">
                {Math.floor(
                  Object.values(songScore).reduce(
                    (a, b) => Number(a) + Number(b),
                    0
                  ) / 3
                )}
                <span className="font-medium text-lg opacity-70"> / 100 </span>
              </div>
            ) : (
              <div className="mt-auto">
                <div className="w-20 h-8 bg-white bg-opacity-20 rounded animate-pulse"></div>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between flex-1 items-end">
            {Object.entries(
              songScore || { popularity: "", longevity: "", lyrics: "" }
            ).map(([category, value], index) => (
              <div className="w-[120px]" key={index}>
                {value ? (
                  <span>{value}</span>
                ) : (
                  <div className="inline-block w-8 h-4 bg-white bg-opacity-20 rounded animate-pulse"></div>
                )}
                <span className="opacity-70 text-lg ml-2 hover:underline">
                  {category[0].toUpperCase() +
                    category.slice(1, category.length + 1)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{ background: dominantColor }}
          className="p-6 flex flex-col flex-1 rounded-lg"
        >
          <h4>Most Streamed Country</h4>
          <p className="opacity-70">Global</p>
          <div className="mt-auto flex gap-4 items-center">
            {topStreamsByCountry ? (
              <>
                <div
                  style={{
                    width: "62px",
                    height: "46.5px",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  className={`fi fi-${topStreamsByCountry}`}
                ></div>
                <div className="">
                  <p className="font-extralight text-[14px] translate-y-1">
                    {topStreamsByCountry
                      ? getCountryRegion(
                          topStreamsByCountry.toUpperCase() as keyof typeof countryCodeMap
                        )
                      : "Unknown Region"}
                  </p>
                  <p className="text-2xl">
                    {topStreamsByCountry
                      ? getCountryName(
                          topStreamsByCountry.toUpperCase() as keyof typeof countryCodeMap
                        )
                      : "Unknown Country"}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex gap-2 items-end">
                <div className="animate-pulse w-20 h-12 bg-white bg-opacity-20 rounded"></div>
                <div className="mt-1">
                  <div className="w-32 h-4 mb-2 bg-white bg-opacity-20 rounded"></div>
                  <div className="w-44 h-4 bg-white bg-opacity-20 rounded"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streaming Chart */}
      <div className="mt-14 bg-spotify-darkGray rounded-lg flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h3 className=" font-semibold">Total streams</h3>
            <div className="h-6 w-px bg-white opacity-30"></div>
            <div className="flex gap-2">
              {(["1M", "3M", "6M", "YTD", "All"] as TimePeriod[]).map(
                (period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-2 py-1 text-sm rounded transition-colors ${
                      selectedPeriod === period
                        ? "bg-white text-black font-medium"
                        : "text-white opacity-60 hover:opacity-100"
                    }`}
                  >
                    {period}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="flex gap-2 relative">
            <div
              className="w-4 h-4 bg-cyan-400 rounded"
              onMouseEnter={() => setHoveredLegend("total")}
              onMouseLeave={() => setHoveredLegend(null)}
            ></div>
            <div
              className="w-4 h-4 bg-purple-400 rounded"
              onMouseEnter={() => setHoveredLegend("daily")}
              onMouseLeave={() => setHoveredLegend(null)}
            ></div>
            {/* Fast custom tooltips */}
            {hoveredLegend && (
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black border border-white border-opacity-20 text-white text-sm sm:text-[16px] rounded whitespace-nowrap z-50">
                {hoveredLegend === "total" ? "Total Streams" : "Daily Streams"}
              </div>
            )}
          </div>
        </div>

        {isLoadingStreamData ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-white opacity-60">Loading chart data...</div>
          </div>
        ) : streamDataError ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-red-400">Error loading chart data</div>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="relative flex-1">
            {/* Y-axis labels for total streams */}
            <div className="absolute left-0 top-0 h-[90%] flex flex-col justify-between text-sm text-cyan-400 opacity-60">
              {[
                totalYScale[1],
                totalYScale[1] * 0.75,
                totalYScale[1] * 0.5,
                totalYScale[1] * 0.25,
                0,
              ].map((value, index) => (
                <div key={index} className="transform -translate-y-2">
                  {formatChartNumber(value)}
                </div>
              ))}
            </div>

            {/* Y-axis labels for daily streams */}
            <div className="absolute right-0 top-0 h-[90%] flex flex-col justify-between text-sm text-purple-400 opacity-60">
              {[
                dailyYScale[1],
                dailyYScale[1] * 0.75,
                dailyYScale[1] * 0.5,
                dailyYScale[1] * 0.25,
                0,
              ].map((value, index) => (
                <div
                  key={index}
                  className="transform -translate-y-2 text-right"
                >
                  {formatChartNumber(value)}
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="pl-14 pr-14 relative w-full h-full">
              <svg
                width="100%"
                height="86%"
                className="overflow-visible"
                viewBox="0 0 1000 200"
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                  <line
                    key={index}
                    x1="0"
                    y1={200 * ratio + ratio * 3}
                    x2="1000"
                    y2={200 * ratio + ratio * 3}
                    stroke="white"
                    strokeOpacity="0.1"
                    strokeWidth="1"
                  />
                ))}

                {/* Total streams line (cyan) */}
                <path
                  d={generateChartPath(
                    filteredData,
                    "total",
                    totalYScale,
                    1000
                  )}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Daily streams line (purple) */}
                <path
                  d={generateChartPath(
                    filteredData,
                    "daily",
                    dailyYScale,
                    1000
                  )}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Hover points */}
                {filteredData.map((point, index) => {
                  const x = (index / (filteredData.length - 1)) * 1000;
                  const totalY =
                    200 -
                    ((point.total - totalYScale[0]) /
                      (totalYScale[1] - totalYScale[0])) *
                      200;
                  const dailyY =
                    200 -
                    ((point.daily - dailyYScale[0]) /
                      (dailyYScale[1] - dailyYScale[0])) *
                      200;

                  return (
                    <g key={index}>
                      {/* Total streams hover point */}
                      <circle
                        cx={x}
                        cy={totalY}
                        r="8"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredPoint({
                            index,
                            data: point,
                            x: rect.left + window.scrollX,
                            y: rect.top + window.scrollY - 10,
                          });
                        }}
                      />
                      {/* Daily streams hover point */}
                      <circle
                        cx={x}
                        cy={dailyY}
                        r="8"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredPoint({
                            index,
                            data: point,
                            x: rect.left + window.scrollX,
                            y: rect.top + window.scrollY - 10,
                          });
                        }}
                      />
                      {/* Visible dots when hovered */}
                      {hoveredPoint?.index === index && (
                        <>
                          <circle cx={x} cy={totalY} r="4" fill="#22d3ee" />
                          <circle cx={x} cy={dailyY} r="4" fill="#c084fc" />
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Hover tooltip */}
              {hoveredPoint && (
                <div
                  className="fixed z-50 bg-black border border-white border-opacity-20 rounded-lg p-3 text-sm sm:text-[16px] text-white shadow-lg pointer-events-none"
                  style={{
                    left: hoveredPoint.x - 100,
                    top: hoveredPoint.y - 80,
                  }}
                >
                  <div className="font-semibold mb-2">
                    {new Date(hoveredPoint.data.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </div>
                  {hoveredPoint?.data?.total != null && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded"></div>
                      <span className="text-cyan-400">Total:</span>
                      <span className="font-extralight">
                        {hoveredPoint.data.total.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {hoveredPoint?.data?.daily != null && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded"></div>
                      <span className="text-purple-400">Daily:</span>
                      <span className="font-extralight">
                        {hoveredPoint.data.daily.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* X-axis labels */}
              <div className="flex justify-between mt-6 mr-8 text-sm text-white opacity-60">
                {filteredData.length > 0 && (
                  <>
                    <span>
                      {new Date(filteredData[0].date).toLocaleDateString(
                        "en-US",
                        { day: "2-digit", month: "short" }
                      )}
                    </span>
                    {filteredData.length > 4 && (
                      <>
                        <span>
                          {new Date(
                            filteredData[
                              Math.floor(filteredData.length * 0.25)
                            ].date
                          ).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                        <span>
                          {new Date(
                            filteredData[
                              Math.floor(filteredData.length * 0.5)
                            ].date
                          ).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                        <span>
                          {new Date(
                            filteredData[
                              Math.floor(filteredData.length * 0.75)
                            ].date
                          ).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </>
                    )}
                    <span>
                      {new Date(
                        filteredData[filteredData.length - 1].date
                      ).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-white opacity-60">No chart data available</div>
          </div>
        )}
      </div>
    </div>
  );
}
