"use client";

import setColorCookie from "@/app/actions";
import { useEffect, useCallback, useMemo } from "react";

interface CookieSetterProps {
  dominantColor: string;
  id: string;
}

export default function CookieSetter({ dominantColor, id }: CookieSetterProps) {
  // Memoize the color array to prevent reference changes
  const memoizedColor = useMemo(() => dominantColor, [dominantColor]);

  // Memoize the action call
  const setCookie = useCallback(async () => {
    if (memoizedColor && memoizedColor.length > 0) {
      try {
        await setColorCookie(memoizedColor, id);
      } catch (error) {
        console.error("Failed to set color cookie:", error);
      }
    }
  }, [memoizedColor, id]);

  useEffect(() => {
    setCookie();
  }, [setCookie]);

  return null;
}
