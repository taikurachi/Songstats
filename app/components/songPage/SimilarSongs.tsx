import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
type SimilarSongsProps = {
  dominantColor: number[];
};
export default function SimilarSongs({ dominantColor }: SimilarSongsProps) {
  return (
    <div
      className="p-8 rounded-xl row-span-2 col-start-3 row-start-2"
      style={{ backgroundColor: convertToRGB(dominantColor) }}
    >
      <h2 className="font-bold text-2xl">Similar Songs</h2>
    </div>
  );
}
