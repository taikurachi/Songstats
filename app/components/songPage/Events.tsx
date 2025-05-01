import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import { fetchEvents } from "@/app/utilsFn/fetchEvents";
import Event from "./Event";
type EventsProps = {
  songData: {
    artists: { name: string }[];
  };
  dominantColor: number[];
};

type EventType = {
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
    venues: { name: string; city: { name: string } }[];
  };
};
export default async function Events({ songData, dominantColor }: EventsProps) {
  if (!songData || !songData.artists[0].name) {
    return <div>No event data available.</div>;
  }
  const data = await fetchEvents(songData.artists[0].name);
  const eventsData = data.length > 6 ? data.slice(0, 6) : data;
  return (
    <div
      className="rounded-xl p-8 col-span-2"
      style={{ backgroundColor: convertToRGB(dominantColor) }}
    >
      <h2 className="text-2xl font-bold">{`${songData.artists[0].name}'s Events`}</h2>
      {eventsData.length > 0 ? (
        <div className="grid mt-8 grid-cols-3 gap-4">
          {eventsData.map((eventData: EventType, index: number) => (
            <Event eventData={eventData} key={index} />
          ))}
        </div>
      ) : (
        <p>No events available</p>
      )}
    </div>
  );
}
