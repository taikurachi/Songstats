import axios from "axios";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const artistName = url.searchParams.get("artistName");

  if (!artistName) {
    return new Response(JSON.stringify({ error: "artistName is required" }), {
      status: 400,
    });
  }

  try {
    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${
        process.env.TICKETMASTER_API_KEY
      }&keyword=${encodeURIComponent(artistName)}&size=8`
    );

    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch events" }), {
      status: 500,
    });
  }
}
