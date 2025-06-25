import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🚀 API route /api/kworb-country POST called");

  try {
    const body = await request.json();
    const { trackId } = body;

    if (!trackId) {
      console.log("❌ Missing trackId parameter in POST request");
      return NextResponse.json(
        {
          success: false,
          error: "Missing trackId parameter",
          topStreamsByCountry: null,
        },
        { status: 400 }
      );
    }

    return executeKworbScraper(trackId);
  } catch (error) {
    console.error("❌ Error parsing request body:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request body",
        topStreamsByCountry: null,
      },
      { status: 400 }
    );
  }
}

async function executeKworbScraper(trackId: string): Promise<NextResponse> {
  console.log(`🔍 Calling external Kworb API for track ID: ${trackId}`);

  try {
    // Directly call the Lambda function without using our wrapper
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://x4sk77vwsrvljbhf6kuadckxgu0lihqs.lambda-url.us-east-2.on.aws?action=kworb&track_id=${encodeURIComponent(
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
      return NextResponse.json(
        {
          success: false,
          error: `External API error: ${response.status}`,
          topStreamsByCountry: null,
        },
        { status: 500 }
      );
    }

    const result = await response.json();

    if (result.success && result.data) {
      console.log("✅ External Kworb API result:", result);
      return NextResponse.json({
        success: true,
        topStreamsByCountry: result.data.topStreamsByCountry,
        topStreamCount: result.data.topStreamCount,
        trackId: result.data.track_id,
        allCountries: result.data.allCountries,
      });
    } else {
      console.log("❌ External Kworb API failed: No data returned");
      return NextResponse.json(
        {
          success: false,
          error: result.error || "No data returned from external API",
          topStreamsByCountry: null,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Scraping error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        topStreamsByCountry: null,
      },
      { status: 500 }
    );
  }
}
