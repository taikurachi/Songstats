// Utility functions to call external Python scraper API

const SCRAPER_API_BASE_URL = "/api/external-scraper";

interface ScraperApiResponse<T = unknown> {
  success: boolean;
  track_id?: string;
  data?: T;
  chart_data?: T;
  error?: string;
}

interface MyStreamCountData {
  track_id: string;
  url: string;
  scraped_at: string;
  track_info: {
    title?: string;
    artist?: string;
    artist_url?: string;
    artwork_url?: string;
    album_name?: string;
    spotify_url?: string;
    total_streams?: number;
    streams_text?: string;
    release_date?: string;
  };
  streaming_data?: {
    api_url?: string;
    csrf_token?: string;
    sample_total_data?: string[];
    sample_daily_data?: string[];
  };
  chart_data?: {
    api_response?: unknown;
    api_status?: string;
    chart_data?: unknown;
    error?: string;
    status_code?: number;
  };
  related_tracks?: Array<{
    title?: string;
    artist?: string;
    streams?: number;
    url?: string;
  }>;
}

interface KworbCountryData {
  trackId: string;
  url: string;
  topStreamsByCountry: string;
  topStreamCount: number;
  allCountries: Array<{
    country: string;
    streams: number;
  }>;
}

export async function fetchExternalStreamCountData(
  trackId: string,
  timeout: number = 30000
): Promise<MyStreamCountData | null> {
  try {
    console.log(`📡 Calling external scraper API for stream count: ${trackId}`);

    const response = await fetch(
      `${SCRAPER_API_BASE_URL}?action=stream_count&track_id=${encodeURIComponent(
        trackId
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(timeout),
      }
    );

    if (!response.ok) {
      console.error(
        `❌ External API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const result: ScraperApiResponse<MyStreamCountData> = await response.json();

    if (!result.success) {
      console.error("❌ External scraper failed:", result.error);
      return null;
    }

    console.log("✅ External stream count data received");
    return result.data || null;
  } catch (error) {
    console.error("❌ Error calling external stream count API:", error);
    return null;
  }
}

export async function fetchExternalChartDataOnly(
  trackId: string,
  timeout: number = 30000
): Promise<unknown> {
  try {
    console.log(
      `📊 Calling external scraper API for chart data only: ${trackId}`
    );

    const response = await fetch(
      `${SCRAPER_API_BASE_URL}?action=chart_data&track_id=${encodeURIComponent(
        trackId
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(timeout),
      }
    );

    if (!response.ok) {
      console.error(
        `❌ External chart API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const result: ScraperApiResponse = await response.json();

    if (!result.success) {
      console.error("❌ External chart scraper failed:", result.error);
      return null;
    }

    console.log("✅ External chart data received");
    return result.chart_data;
  } catch (error) {
    console.error("❌ Error calling external chart data API:", error);
    return null;
  }
}

export async function fetchExternalKworbData(
  trackId: string,
  timeout: number = 30000
): Promise<KworbCountryData | null> {
  try {
    console.log(`🌍 Calling external scraper API for Kworb data: ${trackId}`);

    // Create AbortController for timeout (compatible with older Node.js versions)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(
      `${SCRAPER_API_BASE_URL}?action=kworb&track_id=${encodeURIComponent(
        trackId
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        `❌ External Kworb API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const result: ScraperApiResponse<KworbCountryData> = await response.json();

    if (!result.success) {
      console.error("❌ External Kworb scraper failed:", result.error);
      return null;
    }

    console.log("✅ External Kworb data received");
    return result.data || null;
  } catch (error) {
    console.error("❌ Error calling external Kworb API:", error);
    return null;
  }
}

export async function fetchExternalBatchData(
  trackIds: string[],
  timeout: number = 60000
): Promise<
  {
    track_id: string;
    stream_data?: MyStreamCountData;
    kworb_data?: KworbCountryData;
    success: boolean;
    error?: string;
  }[]
> {
  try {
    console.log(
      `📦 Calling external scraper API for batch data: ${trackIds.length} tracks`
    );

    const response = await fetch(`${SCRAPER_API_BASE_URL}/api/batch-scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        track_ids: trackIds,
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      console.error(
        `❌ External batch API error: ${response.status} ${response.statusText}`
      );
      return trackIds.map((id) => ({
        track_id: id,
        success: false,
        error: "API unavailable",
      }));
    }

    const result: ScraperApiResponse<{
      results: Array<{
        track_id: string;
        stream_data?: MyStreamCountData;
        kworb_data?: KworbCountryData;
        success: boolean;
        error?: string;
      }>;
    }> = await response.json();

    if (!result.success || !result.data) {
      console.error("❌ External batch scraper failed:", result.error);
      return trackIds.map((id) => ({
        track_id: id,
        success: false,
        error: result.error,
      }));
    }

    console.log("✅ External batch data received");
    return result.data.results;
  } catch (error) {
    console.error("❌ Error calling external batch API:", error);
    return trackIds.map((id) => ({
      track_id: id,
      success: false,
      error: String(error),
    }));
  }
}

// Health check function
export async function checkScraperApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${SCRAPER_API_BASE_URL}?action=health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error("❌ Scraper API health check failed:", error);
    return false;
  }
}
