import { NextRequest, NextResponse } from "next/server";
import ColorThief from "pure-color-thief-node";
import fetch from "node-fetch";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const encodedImageUrl: string | null = url.searchParams.get("imageUrl");

  if (!encodedImageUrl) {
    return new Response(JSON.stringify({ error: "imageUrl is required" }), {
      status: 400,
    });
  }
  try {
    const imageUrl = decodeURIComponent(encodedImageUrl);
    const imageResponse = await fetch(imageUrl);
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    const img = new ColorThief();
    await img.loadImage(imageBuffer, "image/jpeg");
    const dominantColorArr = img.getColor();
    // if color is too close to black, we redirect to gray
    if (dominantColorArr.every((channel: number) => channel < 30)) {
      return NextResponse.json({ dominantColorArr: [80, 80, 80] });
    }
    return NextResponse.json({ dominantColorArr });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
