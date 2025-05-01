import axios from "axios";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const artistName = `${url.searchParams.get("artistName")}`;
    const songName = `${url.searchParams.get("songName")}`;

    if (!songName) {
      return new Response("songName is required", { status: 400 });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY; // API Key from .env.local

    if (!apiKey) {
      console.error("🚨 Missing PERPLEXITY_API_KEY in environment");
      return new Response("Server config error", { status: 500 });
    }

    const apiURL: string = "https://api.perplexity.ai/chat/completions";
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const query: string = `What is the inspiration behind the song ${songName} by ${artistName}? Can you explain in 3 sentences. No more than 30 words per sentence. What are the specific instruments used in this song? Give me only instrument names.`;

    const payload = {
      model: "sonar",
      messages: [
        { role: "system", content: "Be precise and concise." },
        { role: "user", content: query },
      ],
    };

    const response = await axios.post(apiURL, payload, { headers });

    // Return the search results
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.error("Error fetching data from Perplexity API:", error);
    return new Response("Failed to fetch from Perplexity API", { status: 500 });
  }
}
