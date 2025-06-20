import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(request) {
  try {
    const body = await request.json();
    const { trackId, trackUrl } = body;

    console.log("Song Details API called with:", { trackId, trackUrl });

    if (!trackId && !trackUrl) {
      console.log("Error: Missing required parameters");
      return NextResponse.json(
        { error: "Either trackId or trackUrl is required" },
        { status: 400 }
      );
    }

    // Path to the Python script
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "details_scraper.py"
    );
    console.log("Script path:", scriptPath);

    // Execute the Python script
    const result = await executePythonScript(scriptPath, trackId, trackUrl);

    console.log("Python script execution completed");
    console.log("Result:", JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in song-details API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Safer URL parsing
    const url = new URL(request.url);
    const trackId = url.searchParams.get("trackId");
    const trackUrl = url.searchParams.get("trackUrl");

    console.log("Song Details API (GET) called with:", { trackId, trackUrl });

    if (!trackId && !trackUrl) {
      console.log("Error: Missing required parameters");
      return NextResponse.json(
        { error: "Either trackId or trackUrl is required" },
        { status: 400 }
      );
    }

    // Path to the Python script
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "details_scraper.py"
    );
    console.log("Script path:", scriptPath);

    // Execute the Python script
    const result = await executePythonScript(scriptPath, trackId, trackUrl);

    console.log("Python script execution completed");
    console.log("Result:", JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in song-details API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

function executePythonScript(scriptPath, trackId, trackUrl) {
  return new Promise((resolve, reject) => {
    console.log("Starting Python script execution...");

    // Prepare arguments for the Python script
    const args = [scriptPath];

    if (trackId) {
      args.push("--track-id", trackId);
    }

    if (trackUrl) {
      args.push("--track-url", trackUrl);
    }

    console.log("Python command:", "python3", args.join(" "));

    const pythonProcess = spawn("python3", args, {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;
      console.log("Python stdout:", output);
    });

    pythonProcess.stderr.on("data", (data) => {
      const error = data.toString();
      stderr += error;
      console.error("Python stderr:", error);
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python script exited with code: ${code}`);

      if (code === 0) {
        try {
          // Try to parse the output as JSON
          const result = JSON.parse(stdout);
          console.log("Successfully parsed Python output as JSON");
          resolve(result);
        } catch (parseError) {
          console.log(
            "Could not parse as JSON, returning raw output:",
            parseError.message
          );
          resolve({
            success: true,
            output: stdout,
            raw_output: true,
            parse_error: parseError.message,
          });
        }
      } else {
        console.error("Python script failed with code:", code);
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Failed to start Python process:", error);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    // Set a timeout for the script execution (5 minutes)
    setTimeout(() => {
      pythonProcess.kill("SIGTERM");
      reject(new Error("Python script execution timed out"));
    }, 300000);
  });
}
