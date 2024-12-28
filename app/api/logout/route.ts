import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(
    JSON.stringify({ message: "Logged out successfully" }),
    {
      headers: {
        "Set-Cookie": [
          `spotifyAccessToken=; Path=/; HttpOnly; Max-Age=0`,
          `spotifyRefreshToken=; Path=/; HttpOnly; Max-Age=0`,
        ].join(", "),
        "Content-Type": "application/json",
      },
    }
  );
}
