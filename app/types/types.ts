export type SongType = {
  album: {
    name: string;
    images: { height: number; width: number; url: string }[];
    release_date: string;
  };
  name: string;
  artists: { id: string; name: string }[];
  id: string;
  popularity: string;
  duration_ms: number;
  external_ids: {
    isrc: string;
  };
  imageURL?: string;
};

export type AlbumType = {
  id: string;
  artists: ArtistType[];
  album_type: string;
  name: string;
};

export type ArtistType = {
  genres: string[];
  id: string;
  popularity: number;
  images: { url: string; height: number; width: number }[];
  name: string;
};

export type EventType = {
  dates: {
    start: {
      localDate: string;
      dateTime: string;
      localTime: string;
    };
    timezone: string;
  };
  name: string;
  url: string;
  _embedded: {
    venues: { city: { name: string }; name: string }[];
  };
};

export type SongDetails = {
  songName: string;
  albumName: string;
  isrc: string;
  artistName: string;
};

export type iconVariants =
  | "time"
  | "home"
  | "discover"
  | "download"
  | "caret"
  | "lyrics"
  | "play"
  | "search"
  | "details"
  | "cancel"
  | "visit"
  | "remix"
  | "arrow"
  | "perplexity"
  | "save"
  | "effects"
  | "grid"
  | "list"
  | "related-icon"
  | "minimize"
  | "spotify"
  | "browse"
  | "history";

export type VideoItem = {
  title: string;
  url: string;
  channel: string;
  duration: string;
  views: string;
  thumbnail: string;
  video_id: string;
};

export type ApiResponse = {
  query: string;
  total_results: number;
  videos: VideoItem[];
  timestamp?: string;
  error?: string;
};
