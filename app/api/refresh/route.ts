import { NextResponse } from "next/server";
import querystring from "querystring";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return NextResponse.json(
      { error: "No cookies found in the request" },
      { status: 400 }
    );
  }

  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => {
      const [key, value] = cookie.split("=");
      return [key, decodeURIComponent(value)];
    })
  );
  console.log(cookies, "cookies");
  const refreshToken = cookies.spotifyRefreshToken;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Refresh token is missing" },
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
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    const accessToken = data.access_token;
    const expiresIn = data.expires_in;

    // Update the access token in cookies
    return new NextResponse(JSON.stringify({ accessToken }), {
      headers: {
        "Set-Cookie": `spotifyAccessToken=${accessToken}; Path=/; HttpOnly; Max-Age=${expiresIn}`,
        "Content-Type": "application/json",
      },
    });
  }

  return NextResponse.json(
    { error: data.error || "Failed to refresh access token" },
    { status: 400 }
  );
}
