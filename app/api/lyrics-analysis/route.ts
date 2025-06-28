import axios from "axios";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { artistName, songName, lyrics, albumName } = body;

    if (!songName || !artistName || !lyrics || !albumName) {
      console.log("Step 2 FAILED - Missing parameters");
      return new Response("Missing required parameters", { status: 400 });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.error("Step 3 FAILED - Missing PERPLEXITY_API_KEY");
      return new Response("Server config error", { status: 500 });
    }

    const apiURL = "https://api.perplexity.ai/chat/completions";
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const query = `Analyze the lyrics of "${songName}" by ${artistName} from the album "${albumName}".

Lyrics: ${lyrics}

Identify the most significant and meaningful lines from these lyrics and provide analysis for each. Return your response as valid JSON only with this exact structure:

{
  "lyrics_analysis": {
    "specific lyric line 1": {
      "analysis": "detailed analysis of meaning, symbolism, and significance",
      "themes": "themes that capture the overall message of given analysis"
    },
    "specific lyric line 2": {
      "analysis": "detailed analysis of meaning, symbolism, and significance",
      "themes": "themes that capture the overall message of given analysis"
    },
    "specific lyric line 3": {
      "analysis": "detailed analysis of meaning, symbolism, and significance",
      "themes": "themes that capture the overall message of given analysis"
    },
    "specific lyric line 4": {
      "analysis": "detailed analysis of meaning, symbolism, and significance",
      "themes": "themes that capture the overall message of given analysis"
    },
    "specific lyric line 5": {
      "analysis": "detailed analysis of meaning, symbolism, and significance",
      "themes": "themes that capture the overall message of given analysis"
    }
  }
}

Select 5-8 of the most impactful lines from the lyrics and provide thoughtful analysis for each.`;

    const payload = {
      model: "sonar",
      messages: [
        {
          role: "system",
          content:
            "You are a literary and music analysis expert that responds only with valid JSON. Never include text outside the JSON structure. Analyze lyrics with depth and insight, focusing on meaning, symbolism, and artistic significance.",
        },
        { role: "user", content: query },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    };

    try {
      const response = await axios.post(apiURL, payload, {
        headers,
        timeout: 30000, // 30 second timeout
      });

      const content = response.data.choices[0].message.content;

      try {
        // Strip markdown code blocks if they exist
        let cleanContent = content;
        if (content.startsWith("```json")) {
          cleanContent = content
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "");
          console.log("Stripped markdown code blocks from response");
        } else if (content.startsWith("```")) {
          cleanContent = content.replace(/^```\s*/, "").replace(/\s*```$/, "");
          console.log("Stripped generic code blocks from response");
        }

        const jsonData = JSON.parse(cleanContent);
        return new Response(JSON.stringify(jsonData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error(
          "Step 7 FAILED - JSON parse error:",
          parseError instanceof Error ? parseError.message : parseError
        );
        console.error("Raw content that failed to parse:", content);
        return new Response(
          JSON.stringify({
            error: "Invalid JSON response from API",
            raw_content: content,
            parse_error:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),
          }),
          { status: 500 }
        );
      }
    } catch (apiError) {
      const errorMessage =
        apiError instanceof Error ? apiError.message : String(apiError);
      const axiosError = axios.isAxiosError(apiError) ? apiError : null;

      console.error("Step 5 FAILED - Perplexity API error:", {
        message: errorMessage,
        status: axiosError?.response?.status,
        statusText: axiosError?.response?.statusText,
        data: axiosError?.response?.data,
        code: axiosError?.code,
      });
      return new Response(
        JSON.stringify({
          error: "Perplexity API error",
          details: errorMessage,
          status: axiosError?.response?.status,
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : undefined;

    console.error("🚨 GENERAL ERROR:", {
      message: errorMessage,
      stack: errorStack,
      name: errorName,
    });
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: errorMessage,
      }),
      { status: 500 }
    );
  }
}
