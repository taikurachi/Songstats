import { ReactNode } from "react";

export default function SpotifyGrid({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full grid grid-cols-[200px_1fr] grid-rows-[64px_1fr] overflow-hidden">
      {children}
    </div>
  );
}
