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

    // Python command (check multiple possible locations)
    const pythonCommands = [
      process.env.PYTHON_PATH || "python3",
      "python",
      "/usr/bin/python3",
      "/usr/local/bin/python3",
    ];

    let result = null;
    let lastError = null;

    // Try different Python commands
    for (const pythonCmd of pythonCommands) {
      try {
        const command = `"${pythonCmd}" "${scriptPath}" "${song_name}" "${artist_name}" ${maxResultsNum}`;

        const { stdout, stderr } = await execAsync(command, {
          timeout: 30000, // 30 second timeout
          maxBuffer: 1024 * 1024, // 1MB buffer
        });

        if (stderr) {
          console.warn("Python stderr:", stderr);
        }

        if (stdout.trim()) {
          result = JSON.parse(stdout);
          break; // Success, exit loop
        }
      } catch (error) {
        lastError = error;
        if (error.code !== "ENOENT") {
          // If it's not a "command not found" error, don't try other commands
          break;
        }
        continue; // Try next Python command
      }
    }

    if (!result) {
      // No successful execution
      if (lastError?.code === "ENOENT") {
        return NextResponse.json(
          {
            error: "Python not found. Please install Python 3.",
            details: "Tried: " + pythonCommands.join(", "),
          },
          { status: 500 }
        );
      }

      if (lastError?.signal === "SIGTERM") {
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
          details: lastError?.message || "Unknown error",
        },
        { status: 500 }
      );
    }

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
