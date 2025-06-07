import Image from "next/image";
import { VideoItem } from "@/app/types/types";
export default function VideoCard({ video }: { video: VideoItem }) {
  const handleVideoClick = () => {
    console.log("Opening video:", video.url);
    window.open(video.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="flex flex-col h-80 overflow-hidden rounded-lg shadow-md cursor-pointer hover:shadow-lg p-4 hover:bg-spotify-lightGray"
      onClick={handleVideoClick}
    >
      <div className="relative flex-1 h-24 rounded-lg">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          onError={(e) => {
            console.log("Image failed to load:", video.thumbnail);
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDQgODBMMTc2IDk2TDE0NCAxMTJWODBaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjwvc3ZnPgo=";
          }}
        />
        <div className="absolute left-3 top-3 bg-black bg-opacity-60 font-normal text-white p-3 py-3 rounded-md text-xs">
          {video.duration}
        </div>
      </div>
      <div className="pt-2 flex flex-col">
        <h3 className="font-normal text-sm mb-2 line-clamp-2 text-white">
          {video.title}
        </h3>
        <p className="text-white font-normal text-opacity-90 text-xs mb-1">
          {video.channel}
        </p>
        <p className="text-white font-normal text-opacity-90 text-xs">
          {video.views}
        </p>
      </div>
    </div>
  );
}
