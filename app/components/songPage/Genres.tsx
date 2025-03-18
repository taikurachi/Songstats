import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
type GenresProps = {
  dominantColor: number[];
};
export default function Genres({ dominantColor }: GenresProps) {
  return (
    <div
      className="p-8 rounded-xl"
      style={{ backgroundColor: convertToRGB(dominantColor) }}
    >
      <h2 className="font-bold text-2xl">Genres</h2>
    </div>
  );
}
