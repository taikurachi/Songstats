"use server";
import { cookies } from "next/headers";

const setColorCookie = async (dominantColor: number[], id: string) => {
  const cookieStore = await cookies();
  const colorString = JSON.stringify(dominantColor);

  cookieStore.set(`bg_color_${id}`, colorString, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export default setColorCookie;
