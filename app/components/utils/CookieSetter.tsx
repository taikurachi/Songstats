"use client";

import setColorCookie from "@/app/actions";
import { useEffect } from "react";

export default function CookieSetter({
  dominantColor,
  id,
}: {
  dominantColor: [];
  id: string;
}) {
  useEffect(() => {
    setColorCookie(dominantColor, id);
  }, [dominantColor, id]);
  return null;
}
