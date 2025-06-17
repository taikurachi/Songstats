import { VideoItem } from "@/app/types/types";
import Image from "next/image";
export default function VideoCardList({ video }: { video: VideoItem }) {
  const handleVideoClick = () => {
    console.log("Opening video:", video.url);
    window.open(video.url, "_blank", "noopener,noreferrer");
  };
  return (
    <div
      className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-spotify-lightGray transition-colors duration-200 group"
      onClick={handleVideoClick}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-12 flex-shrink-0 rounded-md overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="80px"
          onError={(e) => {
            console.log("Image failed to load:", video.thumbnail);
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDQgODBMMTc2IDk2TDE0NCAxMTJWODBaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjwvc3ZnPgo=";
          }}
        />
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white px-1 py-0.5 text-xs rounded">
          {video.duration}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 ml-3 min-w-0">
        <h3 className="font-normal text-[16px] text-white line-clamp-2 group-hover:text-gray-200 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs font-normal text-white text-opacity-70">
          <span>{video.channel}</span>
          <span>•</span>
          <span>{video.views}</span>
        </div>
      </div>

      <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 rounded-full hover:scale-102">
          <svg
            className="w-8 h-8 text-spotify-green"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
