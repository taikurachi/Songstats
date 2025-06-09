"use server";
import { cookies } from "next/headers";

const setColorCookie = async (dominantColor: string, id: string) => {
  const cookieStore = await cookies();
  cookieStore.set(`bg_color_${id}`, dominantColor, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export default setColorCookie;
