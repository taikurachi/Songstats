import { NextRequest, NextResponse } from "next/server";

const LAMBDA_URL =
  "https://x4sk77vwsrvljbhf6kuadckxgu0lihqs.lambda-url.us-east-2.on.aws";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const trackId = searchParams.get("track_id");
    const artist = searchParams.get("artist");
    const track = searchParams.get("track");

    // Validate required parameters
    if (!action) {
      return NextResponse.json(
        { success: false, error: "action parameter is required" },
        { status: 400 }
      );
    }

    // Build query string for Lambda function
    const queryParams = new URLSearchParams();
    queryParams.set("action", action);

    if (trackId) queryParams.set("track_id", trackId);
    if (artist) queryParams.set("artist", artist);
    if (track) queryParams.set("track", track);

    const lambdaUrl = `${LAMBDA_URL}?${queryParams.toString()}`;

    console.log(`🚀 Proxying request to Lambda: ${lambdaUrl}`);

    // Call Lambda function server-side (no CORS issues)
    const response = await fetch(lambdaUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Set timeout to 50 seconds
      signal: AbortSignal.timeout(50000),
    });

    if (!response.ok) {
      console.error(
        `❌ Lambda function returned ${response.status}: ${response.statusText}`
      );
      return NextResponse.json(
        { success: false, error: `Lambda function error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Lambda response received:`, data);

    // Return the Lambda response with CORS headers for the frontend
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("❌ Error proxying to Lambda function:", error);

    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        { success: false, error: "Request timeout" },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
