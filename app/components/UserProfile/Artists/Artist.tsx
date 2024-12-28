type ArtistProps = {
  artist: {
    name: string;
  };
};
export default function Artist({ artist }: ArtistProps) {
  return <h1>{artist.name}</h1>;
}
