// TypeScript version of MyStreamCount scraper for Vercel deployment
interface TrackInfo {
  title?: string;
  artist?: string;
  artist_url?: string;
  artwork_url?: string;
  album_name?: string;
  spotify_url?: string;
  total_streams?: number;
  streams_text?: string;
  release_date?: string;
}

interface StreamingData {
  api_url?: string;
  csrf_token?: string;
  sample_total_data?: string[];
  sample_daily_data?: string[];
}

interface ChartDataResponse {
  api_response?: unknown;
  api_status?: string;
  chart_data?: unknown;
  error?: string;
  status_code?: number;
}

interface MyStreamCountResult {
  track_id: string;
  url: string;
  scraped_at: string;
  success: boolean;
  track_info?: TrackInfo;
  streaming_data?: StreamingData;
  chart_data?: ChartDataResponse;
  error?: string;
}

export async function fetchMyStreamCountData(
  trackId: string
): Promise<MyStreamCountResult> {
  const url = `https://www.mystreamcount.com/track/${trackId}`;

  try {
    // First request to get the page and session cookie
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: AbortSignal.timeout(25000), // 25s timeout for Vercel
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Extract session cookies from the response
    const cookies = response.headers.get("set-cookie");
    console.log("🍪 Session cookies from initial request:", cookies);

    const html = await response.text();
    console.log("🔍 Fetched HTML length:", html.length);

    return {
      track_id: trackId,
      url,
      scraped_at: new Date().toISOString(),
      success: true,
      track_info: extractTrackInfo(html),
      streaming_data: extractStreamingData(html),
      chart_data: await extractChartData(html, trackId, cookies),
    };
  } catch (error) {
    console.error("❌ MyStreamCount fetch error:", error);
    return {
      track_id: trackId,
      url,
      scraped_at: new Date().toISOString(),
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function extractTrackInfo(html: string): TrackInfo {
  const trackInfo: TrackInfo = {};

  console.log("🔍 Starting track info extraction...");
  console.log("📄 HTML length:", html.length);

  // Extract title using exact Python pattern: h1.text-xl.font-bold.text-gray-900
  const titleMatch = html.match(
    /<h1[^>]*class="[^"]*text-xl[^"]*font-bold[^"]*text-gray-900[^"]*"[^>]*>([^<]+)<\/h1>/
  );
  if (titleMatch) {
    trackInfo.title = titleMatch[1].trim();
    console.log("📝 Extracted title:", trackInfo.title);
  } else {
    console.log("❌ Title not found with specific pattern");
    // Try broader pattern
    const broadTitleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (broadTitleMatch) {
      trackInfo.title = broadTitleMatch[1].trim();
      console.log("📝 Extracted title (broad pattern):", trackInfo.title);
    }
  }

  // Extract artist using exact Python pattern: p.text-md.text-gray-500.font-medium.mt-1 a
  const artistMatch = html.match(
    /<p[^>]*class="[^"]*text-md[^"]*text-gray-500[^"]*font-medium[^"]*mt-1[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/
  );
  if (artistMatch) {
    trackInfo.artist_url = artistMatch[1];
    trackInfo.artist = artistMatch[2].trim();
    console.log("🎤 Extracted artist:", trackInfo.artist);
  } else {
    console.log("❌ Artist not found with specific pattern");
    // Try broader pattern for artist
    const broadArtistMatch = html.match(
      /<a[^>]*href="[^"]*artist[^"]*"[^>]*>([^<]+)<\/a>/
    );
    if (broadArtistMatch) {
      trackInfo.artist = broadArtistMatch[1].trim();
      console.log("🎤 Extracted artist (broad pattern):", trackInfo.artist);
    }
  }

  // Extract streams text using exact Python pattern: p.text-md.text-gray-900.my-4.px-4
  console.log("🔍 Looking for streams text...");
  const streamsTextMatch = html.match(
    /<p[^>]*class="[^"]*text-md[^"]*text-gray-900[^"]*my-4[^"]*px-4[^"]*"[^>]*>([^<]+)<\/p>/
  );
  if (streamsTextMatch) {
    trackInfo.streams_text = streamsTextMatch[1].trim();
    console.log("📄 Extracted streams text:", trackInfo.streams_text);

    // Extract total streams from the streams text using exact Python pattern
    const streamsMatch = trackInfo.streams_text.match(
      /(\d{1,3}(?:,\d{3})*)\s*times on Spotify/
    );
    if (streamsMatch) {
      trackInfo.total_streams = parseInt(streamsMatch[1].replace(/,/g, ""));
      console.log("📊 Extracted total streams:", trackInfo.total_streams);
    } else {
      console.log("❌ Stream count not found in streams text");
    }

    // Extract release date using exact Python pattern
    const releaseDateMatch = trackInfo.streams_text.match(
      /since its release on (.+?)\./
    );
    if (releaseDateMatch) {
      trackInfo.release_date = releaseDateMatch[1];
      console.log("📅 Extracted release date:", trackInfo.release_date);
    }
  } else {
    console.log("❌ Streams text not found with specific pattern");
    // Try to find any paragraph with numbers and "times on Spotify"
    const broadStreamsMatch = html.match(
      /(\d{1,3}(?:,\d{3})*)\s*times\s*on\s*Spotify/i
    );
    if (broadStreamsMatch) {
      trackInfo.total_streams = parseInt(
        broadStreamsMatch[1].replace(/,/g, "")
      );
      console.log(
        "📊 Extracted total streams (broad pattern):",
        trackInfo.total_streams
      );
    } else {
      console.log("❌ No stream count found anywhere in HTML");
      // Log a snippet that might contain stream info
      const potentialStreamText = html.match(/times\s*on\s*Spotify/i);
      if (potentialStreamText) {
        const index = html.indexOf(potentialStreamText[0]);
        const snippet = html.substring(Math.max(0, index - 200), index + 200);
        console.log('📄 Found "times on Spotify" context:', snippet);
      }
    }
  }

  // Extract artwork using exact Python pattern: div.w-64.mx-auto img
  const artworkMatch = html.match(
    /<div[^>]*class="[^"]*w-64[^"]*mx-auto[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/
  );
  if (artworkMatch) {
    trackInfo.artwork_url = artworkMatch[1];
    trackInfo.album_name = artworkMatch[2];
    console.log("🎨 Extracted artwork URL:", trackInfo.artwork_url);
  }

  // Extract Spotify URL using exact Python pattern: div.w-64.mx-auto a
  const spotifyMatch = html.match(
    /<div[^>]*class="[^"]*w-64[^"]*mx-auto[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>/
  );
  if (spotifyMatch) {
    trackInfo.spotify_url = spotifyMatch[1];
    console.log("🔗 Extracted Spotify URL:", trackInfo.spotify_url);
  }

  console.log("✅ Track info extraction complete:", trackInfo);
  return trackInfo;
}

function extractStreamingData(html: string): StreamingData {
  const streamingData: StreamingData = {};

  // Extract CSRF token using exact Python pattern: _token: "value"
  const tokenMatch = html.match(/_token:\s*['"]\s*([^'"]+)['"]/);
  if (tokenMatch) {
    streamingData.csrf_token = tokenMatch[1];
    console.log(
      "🔐 Found CSRF token:",
      streamingData.csrf_token.substring(0, 10) + "..."
    );
  }

  // Extract API URL using exact Python pattern: url: "value"
  const apiUrlMatch = html.match(/url:\s*['"]\s*([^'"]+)['"]/);
  if (apiUrlMatch) {
    streamingData.api_url = apiUrlMatch[1];
    console.log("🔗 Found API URL:", streamingData.api_url);
  }

  // Extract sample data using exact Python patterns from createGraph function
  const totalDataMatches = html.match(
    /total\.push\(\[new Date\([^)]+\)\.getTime\(\), ([^\]]+)\]\)/g
  );
  if (totalDataMatches) {
    streamingData.sample_total_data = totalDataMatches.map((match) => {
      const valueMatch = match.match(
        /total\.push\(\[new Date\([^)]+\)\.getTime\(\), ([^\]]+)\]\)/
      );
      return valueMatch ? valueMatch[1] : "";
    });
  }

  const dailyDataMatches = html.match(
    /daily\.push\(\[new Date\([^)]+\)\.getTime\(\), ([^\]]+)\]\)/g
  );
  if (dailyDataMatches) {
    streamingData.sample_daily_data = dailyDataMatches.map((match) => {
      const valueMatch = match.match(
        /daily\.push\(\[new Date\([^)]+\)\.getTime\(\), ([^\]]+)\]\)/
      );
      return valueMatch ? valueMatch[1] : "";
    });
  }

  return streamingData;
}

async function extractChartData(
  html: string,
  trackId: string,
  cookies?: string | null
): Promise<ChartDataResponse> {
  try {
    console.log("📈 Attempting to extract chart data...");

    // Extract CSRF token using exact Python pattern
    console.log("🔍 Looking for CSRF token in HTML...");
    const tokenMatch = html.match(/_token:\s*['"]\s*([^'"]+)['"]/);

    if (!tokenMatch) {
      console.log('❌ No CSRF token found with pattern _token: "value"');
      // Try alternative CSRF token patterns
      const altTokenMatch = html.match(
        /name=['"]*_token['"]*[^>]*value=['"]*([^'"]+)['"]/
      );
      if (altTokenMatch) {
        console.log("🔐 Found CSRF token in input field");
        return await tryMultipleCsrfApproaches(
          altTokenMatch[1],
          trackId,
          cookies,
          html
        );
      } else {
        console.log("❌ No CSRF token found anywhere");
        return { error: "CSRF token not found" };
      }
    }

    const csrfToken = tokenMatch[1];
    console.log("🔐 Found CSRF token:", csrfToken.substring(0, 10) + "...");

    return await tryMultipleCsrfApproaches(csrfToken, trackId, cookies, html);
  } catch (error) {
    console.error("❌ Chart data extraction error:", error);
    return {
      error: error instanceof Error ? error.message : "API request failed",
    };
  }
}

async function tryMultipleCsrfApproaches(
  csrfToken: string,
  trackId: string,
  cookies?: string | null,
  html?: string
): Promise<ChartDataResponse> {
  const approaches = [
    // Approach 1: Use XSRF token from cookies (Laravel standard)
    async () => {
      if (cookies) {
        const xsrfMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
        if (xsrfMatch) {
          const xsrfToken = decodeURIComponent(xsrfMatch[1]);
          console.log("🔄 Attempt 1: Using XSRF token from cookies");
          return await makeApiCall(xsrfToken, trackId, cookies, "xsrf-cookie");
        }
      }
      return null;
    },

    // Approach 2: Use original CSRF token with all Laravel headers
    async () => {
      console.log(
        "🔄 Attempt 2: Using original CSRF token with Laravel headers"
      );
      return await makeApiCall(csrfToken, trackId, cookies, "csrf-laravel");
    },

    // Approach 3: Try making a fresh session first
    async () => {
      console.log(
        "🔄 Attempt 3: Creating fresh session and extracting new token"
      );
      return await makeFreshSessionApiCall(trackId);
    },

    // Approach 4: Use meta tag token if available
    async () => {
      if (html) {
        const metaTokenMatch = html.match(
          /name=['"]*csrf-token['"]*[^>]*content=['"]*([^'"]+)['"]/
        );
        if (metaTokenMatch) {
          console.log("🔄 Attempt 4: Using meta CSRF token");
          return await makeApiCall(
            metaTokenMatch[1],
            trackId,
            cookies,
            "csrf-meta"
          );
        }
      }
      return null;
    },
  ];

  for (let i = 0; i < approaches.length; i++) {
    try {
      const result = await approaches[i]();
      if (result && !result.error && result.status_code !== 419) {
        console.log(`✅ Approach ${i + 1} succeeded!`);
        return result;
      } else if (result) {
        console.log(
          `❌ Approach ${i + 1} failed:`,
          result.error || `Status ${result.status_code}`
        );
      }
    } catch (error) {
      console.log(`❌ Approach ${i + 1} error:`, error);
    }
  }

  // If all approaches failed, return the last error
  console.log("❌ All CSRF approaches failed");
  return {
    error: "All CSRF token approaches failed",
    status_code: 419,
  };
}

async function makeFreshSessionApiCall(
  trackId: string
): Promise<ChartDataResponse> {
  try {
    // Make a fresh request to get new session cookies and token
    const freshResponse = await fetch(
      `https://www.mystreamcount.com/track/${trackId}`,
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
        },
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!freshResponse.ok) {
      return { error: "Failed to create fresh session" };
    }

    const freshHtml = await freshResponse.text();
    const freshCookies = freshResponse.headers.get("set-cookie");

    console.log(
      "🆕 Fresh session cookies:",
      freshCookies?.substring(0, 200) + "..."
    );

    // Extract token from fresh HTML
    const tokenMatch = freshHtml.match(/_token:\s*['"]\s*([^'"]+)['"]/);
    if (tokenMatch) {
      const freshToken = tokenMatch[1];
      console.log("🆕 Fresh CSRF token:", freshToken.substring(0, 10) + "...");
      return await makeApiCall(
        freshToken,
        trackId,
        freshCookies,
        "fresh-session"
      );
    }

    return { error: "No CSRF token in fresh session" };
  } catch (error) {
    return { error: `Fresh session failed: ${error}` };
  }
}

async function makeApiCall(
  csrfToken: string,
  trackId: string,
  cookies?: string | null,
  approach: string = "default"
): Promise<ChartDataResponse> {
  const apiUrl = `https://www.mystreamcount.com/api/track/${trackId}/streams`;
  console.log(`📡 Making API call (${approach}) to:`, apiUrl);

  try {
    // Prepare headers based on approach
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      Referer: `https://www.mystreamcount.com/track/${trackId}`,
      "X-Requested-With": "XMLHttpRequest",
    };

    // Different content types based on approach
    if (approach === "csrf-laravel" || approach === "fresh-session") {
      headers["Content-Type"] =
        "application/x-www-form-urlencoded; charset=UTF-8";
    } else {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    // Add session cookies if available
    if (cookies) {
      headers["Cookie"] = cookies;
      console.log("🍪 Using session cookies in API call");

      // For XSRF approach, add the token as header
      if (approach === "xsrf-cookie") {
        headers["X-XSRF-TOKEN"] = csrfToken;
        console.log("🔐 Using XSRF token as header");
      }
    }

    // For Laravel approach, add additional security headers
    if (approach === "csrf-laravel") {
      headers["X-CSRF-TOKEN"] = csrfToken;
      headers["Cache-Control"] = "no-cache";
      headers["Pragma"] = "no-cache";
    }

    // Prepare request body
    let body: string;
    if (approach === "xsrf-cookie") {
      // For XSRF, don't send token in body since it's in header
      body = "";
    } else {
      body = `_token=${encodeURIComponent(csrfToken)}`;
    }

    console.log(`🔐 Using token approach: ${approach}`);
    console.log("📝 Request body:", body || "(empty)");
    console.log("📋 Request headers:", Object.keys(headers).join(", "));

    // Make API request
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: body || undefined,
      signal: AbortSignal.timeout(30000),
    });

    console.log("📡 API response status:", apiResponse.status);
    console.log(
      "📡 API response headers:",
      Object.fromEntries(apiResponse.headers.entries())
    );

    if (apiResponse.status === 200) {
      const responseText = await apiResponse.text();
      console.log(
        "📄 Raw API response:",
        responseText.substring(0, 500) + "..."
      );

      try {
        const apiData = JSON.parse(responseText);
        console.log("📊 Parsed API data:", apiData);

        return {
          api_response: apiData,
          api_status: apiData.status,
          chart_data: apiData.status === "ready" ? apiData.data : null,
        };
      } catch (parseError) {
        console.error("❌ Failed to parse API response as JSON:", parseError);
        return {
          error: "Failed to parse API response",
          api_response: responseText,
        };
      }
    } else if (apiResponse.status === 419) {
      console.log(`❌ CSRF token rejected (419) for approach: ${approach}`);
      const errorText = await apiResponse.text();
      console.log("📄 Error response:", errorText.substring(0, 500));
      return {
        error: "CSRF token expired or invalid",
        status_code: 419,
        api_response: errorText,
      };
    } else {
      const errorText = await apiResponse.text();
      console.log("❌ API error response:", errorText.substring(0, 500));
      return {
        error: `API request failed with status ${apiResponse.status}`,
        status_code: apiResponse.status,
        api_response: errorText,
      };
    }
  } catch (fetchError) {
    console.error("❌ Fetch error:", fetchError);
    return {
      error: fetchError instanceof Error ? fetchError.message : "Network error",
    };
  }
}

// Helper function to get only chart data with polling (matching Python version)
export async function getChartDataOnly(
  trackId: string,
  maxRetries: number = 3
): Promise<unknown> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`�� Chart data attempt ${attempt + 1}/${maxRetries}`);
      const result = await fetchMyStreamCountData(trackId);

      if (result.success && result.chart_data) {
        if (result.chart_data.api_status === "ready") {
          return {
            track_id: trackId,
            status: "success",
            chart_data: result.chart_data.chart_data,
            retrieved_at: new Date().toISOString(),
          };
        } else if (result.chart_data.api_status === "processing") {
          console.log("⏳ Data still processing, waiting...");
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Match Python 3s wait
          continue;
        }
      }

      return {
        track_id: trackId,
        status: "error",
        error: result.error || "Failed to get chart data",
      };
    } catch (error) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries - 1) {
        return {
          track_id: trackId,
          status: "error",
          error:
            error instanceof Error ? error.message : "Max retries exceeded",
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Match Python 2s retry wait
    }
  }
}
