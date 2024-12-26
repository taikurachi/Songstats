import { NextResponse } from "next/server";

export async function GET() {
  // Clear the cookies by setting their Max-Age to 0
  return new NextResponse(
    JSON.stringify({ message: "Logged out successfully" }),
    {
      headers: {
        "Set-Cookie": [
          `spotifyAccessToken=; Path=/; HttpOnly; Max-Age=0`,
          `spotifyRefreshToken=; Path=/; HttpOnly; Max-Age=0`,
        ].join(", "), // Join the cookies into a single string
        "Content-Type": "application/json",
      },
    }
  );
}
