import Error from "next/error";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotifyAccessToken")?.value;

  if (!accessToken) {
    return new Response("Not authenticated", { status: 401 });
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const userData = await response.json();
    return new Response(JSON.stringify(userData), { status: 200 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
