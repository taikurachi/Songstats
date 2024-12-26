import { NextResponse } from "next/server";
import querystring from "querystring";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code missing" },
      { status: 400 }
    );
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: querystring.stringify({
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  if (response.ok) {
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expiresIn = data.expires_in;

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/`, {
      headers: {
        "Set-Cookie": [
          `spotifyAccessToken=${accessToken}; Path=/; HttpOnly; Max-Age=${expiresIn}`,
          `spotifyRefreshToken=${refreshToken}; Path=/; HttpOnly; Max-Age=31536000`, // 1 year
        ].join(", "),
      },
    });
  }

  return NextResponse.json(
    { error: data.error || "Token exchange failed" },
    { status: 400 }
  );
}
