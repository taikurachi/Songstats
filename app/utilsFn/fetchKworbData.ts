// TypeScript equivalent of Python scraper for Next.js deployment
export async function fetchKworbCountryData(trackId: string) {
  const url = `https://kworb.net/spotify/track/${trackId}.html`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(25000), // 25s timeout for Vercel
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const countryData = extractCountryStreams(html);

    if (countryData.length > 0) {
      const topCountry = countryData.reduce((max, country) =>
        country.streams > max.streams ? country : max
      );

      return {
        success: true,
        trackId,
        url,
        topStreamsByCountry: topCountry.country,
        topStreamCount: topCountry.streams,
        allCountries: countryData,
      };
    } else {
      return {
        success: false,
        trackId,
        url,
        error: "No country data found",
        topStreamsByCountry: null,
      };
    }
  } catch (error) {
    return {
      success: false,
      trackId,
      url,
      error: error instanceof Error ? error.message : "Unknown error",
      topStreamsByCountry: null,
    };
  }
}

function extractCountryStreams(html: string) {
  const countryData: Array<{ country: string; streams: number }> = [];

  // Multiple patterns to catch different table formats on kworb.net
  const patterns = [
    // Pattern 1: Table cells with country codes and numbers
    /<td[^>]*>([A-Z]{2})<\/td>\s*<td[^>]*>([0-9,]+)<\/td>/g,

    // Pattern 2: Country code followed by colon and number
    /([A-Z]{2}):\s*([0-9,]+)/g,

    // Pattern 3: Table with alternating country/stream pattern
    /<td[^>]*>([A-Z]{2})<\/td>[\s\S]*?<td[^>]*>([0-9,]+)<\/td>/g,

    // Pattern 4: Country headers in table
    /<th[^>]*>([A-Z]{2})<\/th>[\s\S]*?<td[^>]*>([0-9,]+)<\/td>/g,
  ];

  // Try each pattern
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const country = match[1];
      const streamText = match[2].replace(/,/g, "");
      const streams = parseInt(streamText);

      if (!isNaN(streams) && streams > 0) {
        // Avoid duplicates
        const existing = countryData.find((c) => c.country === country);
        if (!existing) {
          countryData.push({ country, streams });
        } else if (streams > existing.streams) {
          // Keep the higher number if duplicate
          existing.streams = streams;
        }
      }
    }

    // Reset regex lastIndex for next pattern
    pattern.lastIndex = 0;
  }

  // Fallback: Look for any numbers that might be stream counts
  if (countryData.length === 0) {
    // Extract potential stream counts (6+ digits with commas)
    const numberPattern = /([0-9]{1,3}(?:,\d{3}){2,})/g;
    const numbers = [];
    let match;

    while ((match = numberPattern.exec(html)) !== null) {
      const streams = parseInt(match[1].replace(/,/g, ""));
      if (streams > 100000) {
        // Reasonable threshold for stream counts
        numbers.push(streams);
      }
    }

    // If we found numbers but no countries, return a generic result
    if (numbers.length > 0) {
      return [
        {
          country: "UNKNOWN",
          streams: Math.max(...numbers),
        },
      ];
    }
  }

  return countryData;
}
