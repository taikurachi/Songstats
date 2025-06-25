import { NextResponse } from "next/server";
import {
  fetchExternalStreamCountData,
  fetchExternalChartDataOnly,
} from "../../utilsFn/fetchExternalScraperData";

export async function GET(request) {
  console.log("🚀 API route /api/song-details GET called");

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");
  const chartOnly = searchParams.get("chartOnly") === "true";

  if (!trackId) {
    console.log("❌ Missing trackId parameter");
    return NextResponse.json(
      {
        success: false,
        error: "Missing trackId parameter",
      },
      { status: 400 }
    );
  }

  try {
    console.log(`🔍 Calling external scraper API for track ID: ${trackId}`);

    let result;
    if (chartOnly) {
      const chartData = await fetchExternalChartDataOnly(trackId);
      result = {
        success: chartData ? true : false,
        track_id: trackId,
        chart_data: { chart_data: chartData },
      };
    } else {
      result = await fetchExternalStreamCountData(trackId);
    }

    console.log("📊 External API result:", JSON.stringify(result, null, 2));

    // Handle successful scraping
    if (result.success || result.status === "success") {
      // Extract chart data - handle different response structures
      let chartData = null;
      if (result.chart_data?.chart_data && !result.chart_data.error) {
        chartData = result.chart_data.chart_data;
      } else if (result.chart_data && !result.chart_data.error) {
        chartData = result.chart_data;
      } else if (result.data) {
        chartData = result.data;
      }

      // Log chart data status
      if (result.chart_data?.error) {
        console.log(
          "📊 Chart API error:",
          result.chart_data.error,
          "Status:",
          result.chart_data.status_code
        );
        console.log("⚠️ Chart data not available - returning null");
      } else if (chartData) {
        console.log("📈 Chart data successfully extracted");
      } else {
        console.log("📈 No chart data found");
      }

      // Extract total streams only from scraped data
      let totalStreams = 0;
      if (result.track_info?.total_streams) {
        totalStreams = result.track_info.total_streams;
        console.log("🎵 Total streams from track info:", totalStreams);
      } else if (chartData?.total_streams) {
        totalStreams = chartData.total_streams;
        console.log("🎵 Total streams from chart data:", totalStreams);
      } else if (chartData?.total && Array.isArray(chartData.total)) {
        // Get latest value from chart data
        const latestEntry = chartData.total[chartData.total.length - 1];
        if (latestEntry && Array.isArray(latestEntry) && latestEntry[1]) {
          totalStreams = latestEntry[1];
          console.log("🎵 Total streams from chart total array:", totalStreams);
        }
      }

      // Transform data to match expected MyStreamCountData format - only with real data
      const transformedData = {
        track_id: result.track_id || trackId,
        track_info: {
          title: result.track_info?.title || null,
          artist: result.track_info?.artist || null,
          total_streams: totalStreams || 0,
          release_date: result.track_info?.release_date || null,
          artwork_url: result.track_info?.artwork_url || null,
          album_name: result.track_info?.album_name || null,
        },
        chart_data: {
          chart_data: chartData, // This will be null if scraping failed
        },
        related_tracks: [],
        success: true,
      };

      console.log(
        "✅ Returning scraped data - Title:",
        transformedData.track_info.title,
        "Streams:",
        transformedData.track_info.total_streams
      );

      return NextResponse.json({
        success: true,
        data: transformedData,
      });
    }

    // Handle failed scraping - return empty data structure
    else {
      console.log("❌ Scraping failed - returning empty data structure");

      const emptyData = {
        track_id: trackId,
        track_info: {
          title: null,
          artist: null,
          total_streams: 0,
          release_date: null,
          artwork_url: null,
          album_name: null,
        },
        chart_data: {
          chart_data: null,
        },
        related_tracks: [],
        success: false,
        error: result.error || "Scraping failed",
      };

      return NextResponse.json({
        success: false,
        data: emptyData,
        error: result.error || "Scraping failed",
      });
    }
  } catch (error) {
    console.error("❌ Scraping error:", error);

    // Return empty data structure on error
    const emptyData = {
      track_id: trackId,
      track_info: {
        title: null,
        artist: null,
        total_streams: 0,
        release_date: null,
        artwork_url: null,
        album_name: null,
      },
      chart_data: {
        chart_data: null,
      },
      related_tracks: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json({
      success: false,
      data: emptyData,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function POST(request) {
  console.log("🚀 API route /api/song-details POST called");

  try {
    const body = await request.json();
    const { trackId, chartOnly } = body;

    if (!trackId) {
      console.log("❌ Missing trackId parameter");
      return NextResponse.json(
        {
          success: false,
          error: "Missing trackId parameter",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Calling external scraper API for track ID: ${trackId}`);

    let result;
    if (chartOnly) {
      const chartData = await fetchExternalChartDataOnly(trackId);
      result = {
        success: chartData ? true : false,
        track_id: trackId,
        chart_data: { chart_data: chartData },
      };
    } else {
      result = await fetchExternalStreamCountData(trackId);
    }

    console.log(
      "📊 External API POST result:",
      JSON.stringify(result, null, 2)
    );

    if (result.success || result.status === "success") {
      // Extract chart data - only real data
      let chartData = null;
      if (result.chart_data?.chart_data && !result.chart_data.error) {
        chartData = result.chart_data.chart_data;
      } else if (result.chart_data && !result.chart_data.error) {
        chartData = result.chart_data;
      } else if (result.data) {
        chartData = result.data;
      }

      // Extract total streams only from real data
      let totalStreams = 0;
      if (result.track_info?.total_streams) {
        totalStreams = result.track_info.total_streams;
      } else if (chartData?.total_streams) {
        totalStreams = chartData.total_streams;
      } else if (chartData?.total && Array.isArray(chartData.total)) {
        const latestEntry = chartData.total[chartData.total.length - 1];
        if (latestEntry && Array.isArray(latestEntry) && latestEntry[1]) {
          totalStreams = latestEntry[1];
        }
      }

      // Transform data with only real scraped values
      const transformedData = {
        track_id: result.track_id || trackId,
        track_info: {
          title: result.track_info?.title || null,
          artist: result.track_info?.artist || null,
          total_streams: totalStreams || 0,
          release_date: result.track_info?.release_date || null,
          artwork_url: result.track_info?.artwork_url || null,
          album_name: result.track_info?.album_name || null,
        },
        chart_data: {
          chart_data: chartData,
        },
        related_tracks: [],
        success: true,
      };

      return NextResponse.json({
        success: true,
        data: transformedData,
      });
    } else {
      // Return empty data structure for failed scraping
      const emptyData = {
        track_id: trackId,
        track_info: {
          title: null,
          artist: null,
          total_streams: 0,
          release_date: null,
          artwork_url: null,
          album_name: null,
        },
        chart_data: {
          chart_data: null,
        },
        related_tracks: [],
        success: false,
        error: result.error || "Scraping failed",
      };

      return NextResponse.json({
        success: false,
        data: emptyData,
        error: result.error || "Scraping failed",
      });
    }
  } catch (error) {
    console.error("❌ Error processing POST request:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Invalid request body or scraping failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 400 }
    );
  }
}
