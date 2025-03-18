import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
type AboutProps = {
  dominantColor: number[];
};
export default function Genres({ dominantColor }: AboutProps) {
  return (
    <div
      className="p-8 rounded-xl row-span-2"
      style={{ backgroundColor: convertToRGB(dominantColor) }}
    >
      <h2 className="font-bold text-2xl">About</h2>
    </div>
  );
}
