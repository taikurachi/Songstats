import axios from "axios";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const isrc = url.searchParams.get("isrc");

  if (!isrc) {
    return new Response(JSON.stringify({ error: "ISRC code is required" }), {
      status: 400,
    });
  }

  try {
    const response = await axios.get(
      "https://api.musixmatch.com/ws/1.1/track.lyrics.get",
      {
        params: {
          track_isrc: isrc,
          apikey: process.env.MUSIXMATCH_API_KEY,
        },
      }
    );

    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch lyrics" }), {
      status: 500,
    });
  }
}
