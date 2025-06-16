import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function GET() {
  return NextResponse.json({
    message: "Music Video Scraper API",
    usage: "POST with song_name, artist_name, and optional max_results",
    status: "active",
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { song_name, artist_name, max_results = 10 } = body;

    if (!song_name || !artist_name) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["song_name", "artist_name"],
        },
        { status: 400 }
      );
    }

    // Validate max_results
    const maxResultsNum = parseInt(max_results);
    if (isNaN(maxResultsNum) || maxResultsNum < 1 || maxResultsNum > 50) {
      return NextResponse.json(
        {
          error: "max_results must be a number between 1 and 50",
        },
        { status: 400 }
      );
    }

    console.log(
      `Searching for: ${artist_name} - ${song_name} (${maxResultsNum} results)`
    );

    // Path to Python script
    const scriptPath = path.join(process.cwd(), "scripts", "music_scraper.py");

    // Use the specific Python path for local development
    const pythonPath =
      "/Users/taisei.kurachi/.pyenv/versions/3.10.0/bin/python3";
    const command = `"${pythonPath}" "${scriptPath}" "${song_name}" "${artist_name}" ${maxResultsNum}`;
    console.log("Executing command:", command);

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
      });

      if (stderr) {
        console.warn("Python stderr:", stderr);
      }

      if (!stdout.trim()) {
        throw new Error("No output from Python script");
      }

      const result = JSON.parse(stdout);

      // Add metadata to response
      const response = {
        ...result,
        timestamp: new Date().toISOString(),
        search_time: new Date().toISOString(),
      };

      return NextResponse.json(response, {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600", // Cache for 30 minutes
        },
      });
    } catch (error) {
      console.error("Python script execution error:", error);

      if (error.signal === "SIGTERM") {
        return NextResponse.json(
          {
            error: "Request timeout. Try reducing max_results.",
            timeout: "30 seconds",
          },
          { status: 408 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to execute Python script",
          details: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API Route Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Optional: Add OPTIONS for CORS if needed
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
