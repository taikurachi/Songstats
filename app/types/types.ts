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
    venues: { name: string }[];
  };
};
