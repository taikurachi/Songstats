import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
type DetailsProps = {
  dominantColor: number[];
};
export default function Details({ dominantColor }: DetailsProps) {
  return (
    <div
      className="p-8 rounded-xl col-start-1"
      style={{ backgroundColor: convertToRGB(dominantColor) }}
    >
      <h2 className="font-bold text-2xl">Details</h2>
    </div>
  );
}
