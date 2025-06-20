import axios from "axios";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🚀 API route /api/lyrics-score POST called");

  try {
    const body = await request.json();
    const { lyrics } = body;

    if (!lyrics) {
      console.log("Missing lyrics parameter");
      return new Response("Missing lyrics parameter", { status: 400 });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.error("Missing PERPLEXITY_API_KEY");
      return new Response("Server config error", { status: 500 });
    }

    const apiURL = "https://api.perplexity.ai/chat/completions";
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const query = `Analyze these lyrics and provide a single quality score from 0-100 based on:

1. **Literary Quality & Depth** (0-25 points): Sophistication, metaphors, symbolism, poetic devices
2. **Emotional Resonance** (0-25 points): Emotional impact, relatability, authenticity of feeling
3. **Originality & Creativity** (0-25 points): Unique perspective, fresh imagery, innovative expression
4. **Meaning & Substance** (0-25 points): Thematic depth, message clarity, philosophical insight

Lyrics to analyze:
${lyrics}

Return ONLY a valid JSON response with this exact structure:
{
  "score": 85
}

The score should be an integer from 0-100 representing the overall lyrical quality.`;

    const payload = {
      model: "sonar",
      messages: [
        {
          role: "system",
          content:
            "You are a music and literary critic expert. Analyze lyrics objectively and return only valid JSON with a single score. Consider poetic quality, emotional depth, originality, and meaning. Be critical but fair - most good songs score 60-80, exceptional lyrics score 80-95, masterpieces score 95+.",
        },
        { role: "user", content: query },
      ],
      temperature: 0.1,
      max_tokens: 50,
    };

    try {
      const response = await axios.post(apiURL, payload, {
        headers,
        timeout: 30000,
      });

      const content = response.data.choices[0].message.content;

      try {
        // Strip markdown code blocks if they exist
        let cleanContent = content;
        if (content.startsWith("```json")) {
          cleanContent = content
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "");
        } else if (content.startsWith("```")) {
          cleanContent = content.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        const jsonData = JSON.parse(cleanContent);

        // Validate score is a number between 0-100
        const score = parseInt(jsonData.score);
        if (isNaN(score) || score < 0 || score > 100) {
          throw new Error("Invalid score value");
        }

        return new Response(JSON.stringify({ score }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("JSON parse error:", parseError.message);
        console.error("Raw content:", content);

        // Fallback: try to extract number from response
        const numberMatch = content.match(/\d+/);
        if (numberMatch) {
          const score = Math.min(100, Math.max(0, parseInt(numberMatch[0])));
          return new Response(JSON.stringify({ score }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ error: "Invalid response format", score: 50 }),
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error("Perplexity API error:", apiError.message);
      return new Response(JSON.stringify({ error: "API error", score: 50 }), {
        status: 500,
      });
    }
  } catch (error) {
    console.error("General error:", error.message);
    return new Response(JSON.stringify({ error: "Server error", score: 50 }), {
      status: 500,
    });
  }
}
