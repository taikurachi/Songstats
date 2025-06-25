"use client";
import { iconVariants } from "@/app/types/types";
import Icon from "./Icon";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";

const icons = {
  home: "Home",
  lyrics: "Lyrics",
  "related-media": "Media",
  details: "Details",
};

export default function Sidebar() {
  const { id } = useParams();
  const pathname = usePathname();

  // Check if we're on a valid song route
  const isOnSongRoute = pathname.startsWith("/songs/") && id;

  return (
    <nav className="sticky top-20 left-0 h-full bg-spotify-darkGray rounded-lg text-white overflow-y-auto z-20 px-2 py-4 mx-2">
      <div className="mx-3 flex justify-between mb-8">
        <p className="text-xl font-semibold">Your Menu</p>
        <Icon
          variant="minimize"
          size={16}
          className="opacity-80 hover:opacity-100 cursor-pointer"
        />
      </div>
      <ul className="flex flex-col">
        {Object.entries(icons).map(([key, value]) => {
          const pathMap: Record<string, string> = {
            home: `/songs/${id}`,
            lyrics: `/songs/${id}/lyrics`,
            "related-media": `/songs/${id}/related-media`,
            details: `/songs/${id}/details`,
          };

          const linkPath = pathMap[key] || `/songs/${id}`;

          return (
            <li
              className={`flex items-center gap-6 p-2 ${
                isOnSongRoute
                  ? "hover:bg-spotify-gray cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
              key={key}
            >
              {isOnSongRoute ? (
                <Link href={linkPath} className="flex items-center gap-6">
                  <div className="p-3 rounded-md bg-spotify-lightGray w-14 h-14 flex items-center justify-center">
                    <Icon variant={key as iconVariants} size={22} />
                  </div>
                  <p className="text-lg">{value}</p>
                </Link>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="p-3 rounded-md bg-spotify-lightGray w-14 h-14 flex items-center justify-center">
                    <Icon variant={key as iconVariants} size={22} />
                  </div>
                  <p className="text-lg">{value}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
