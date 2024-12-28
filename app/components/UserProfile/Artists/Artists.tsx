import { ArtistType } from "@/app/utilFn/fetchSpotifyData";
import Artist from "./Artist";
type ArtistsProps = {
  topArtists: ArtistType[];
};
export default function Artists({ topArtists }: ArtistsProps) {
  return topArtists.map((artist: ArtistType, index: number) => (
    <Artist artist={artist} key={index} />
  ));
}
