import { NextResponse } from "next/server";

export function GET() {
  const scope =
    "user-read-private user-read-email user-top-read user-follow-read";
  const clientID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectURI = process.env.SPOTIFY_REDIRECT_URI!;

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientID}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(redirectURI)}`;

  return NextResponse.redirect(authUrl);
}
