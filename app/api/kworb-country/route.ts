import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function GET(request: NextRequest) {
  console.log("🚀 API route /api/kworb-country GET called");

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");

  if (!trackId) {
    console.log("❌ Missing trackId parameter in GET request");
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
}

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
  console.log(`🔍 Scraping kworb.net for track ID: ${trackId}`);

  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), "scripts", "kworb_scraper.py");
    console.log(`📍 Script path: ${scriptPath}`);

    const pythonProcess = spawn("python3", [scriptPath, "--track-id", trackId]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      const chunk = data.toString();
      console.log(`📤 Python stdout chunk: ${chunk}`);
      stdout += chunk;
    });

    pythonProcess.stderr.on("data", (data) => {
      const chunk = data.toString();
      console.error(`📤 Python stderr chunk: ${chunk}`);
      stderr += chunk;
    });

    pythonProcess.on("close", (code) => {
      console.log(`🏁 Python process exited with code: ${code}`);
      console.log(`📋 Full stdout: ${stdout}`);
      console.log(`📋 Full stderr: ${stderr}`);

      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          console.log("✅ Successfully parsed Python output:", result);

          if (result.success) {
            resolve(
              NextResponse.json({
                success: true,
                topStreamsByCountry: result.topStreamsByCountry,
                topStreamCount: result.topStreamCount,
                trackId: result.track_id,
                allCountries: result.allCountries,
              })
            );
          } else {
            console.log("❌ Python script reported failure:", result.error);
            resolve(
              NextResponse.json(
                {
                  success: false,
                  error: result.error || "Scraping failed",
                  topStreamsByCountry: null,
                },
                { status: 500 }
              )
            );
          }
        } catch (parseError) {
          console.error("❌ Error parsing Python output:", parseError);
          console.error("Raw stdout:", stdout);
          resolve(
            NextResponse.json(
              {
                success: false,
                error: "Failed to parse scraper output",
                topStreamsByCountry: null,
              },
              { status: 500 }
            )
          );
        }
      } else {
        console.error(`❌ Python process failed with code ${code}`);
        console.error("stderr:", stderr);
        resolve(
          NextResponse.json(
            {
              success: false,
              error: `Scraper process failed: ${stderr}`,
              topStreamsByCountry: null,
            },
            { status: 500 }
          )
        );
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("❌ Failed to start Python process:", error);
      resolve(
        NextResponse.json(
          {
            success: false,
            error: `Failed to start scraper: ${error.message}`,
            topStreamsByCountry: null,
          },
          { status: 500 }
        )
      );
    });

    // Set timeout for the process
    const timeout = setTimeout(() => {
      console.log("⏰ Killing Python process due to timeout");
      pythonProcess.kill();
      resolve(
        NextResponse.json(
          {
            success: false,
            error: "Scraper timeout",
            topStreamsByCountry: null,
          },
          { status: 500 }
        )
      );
    }, 60000); // 1 minute timeout

    pythonProcess.on("close", () => {
      clearTimeout(timeout);
    });
  });
}
