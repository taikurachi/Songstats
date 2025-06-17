import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
export async function GET() {
  try {
    const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    // Log environment variables (without sensitive data)
    console.log("Environment check:", {
      hasRefreshToken: !!refresh_token,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
    });

    if (!refresh_token || !clientId || !clientSecret) {
      console.error("Missing environment variables:", {
        missingRefreshToken: !refresh_token,
        missingClientId: !clientId,
        missingClientSecret: !clientSecret,
      });
      return NextResponse.json(
        { error: "Missing environment variables" },
        { status: 500 }
      );
    }

    const tokenUrl = "https://accounts.spotify.com/api/token";
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    });

    console.log("Attempting to fetch token from Spotify...");

    const response = await axios.post(tokenUrl, params, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.data.access_token) {
      console.error("No access token in response:", response.data);
      return NextResponse.json(
        { error: "No access token received" },
        { status: 500 }
      );
    }

    const accessToken = response.data.access_token;
    console.log("Successfully received access token");

    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: accessToken,
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "strict",
    });

    console.log("Cookie set successfully");

    return NextResponse.json({ access_token: accessToken });
  } catch (error) {
    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      console.error("Spotify API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } else {
      console.error("Unexpected error:", error);
    }

    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 500 }
    );
  }
}
