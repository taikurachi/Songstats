type EventProps = {
  eventData: EventType;
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

export default function Event({ eventData }: EventProps) {
  const date = new Date(eventData.dates.start.dateTime);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
  const city = eventData._embedded.venues[0].city?.name;
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
  const time = eventData.dates.start.localTime
    ? new Date(
        `1970-01-01T${eventData.dates.start.localTime}`
      ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";
  const venue = eventData._embedded.venues[0].name;

  return (
    <div className="flex items-center gap-4 overflow-hidden hover:bg-slate-500">
      <div className="p-2 pr-4 pl-4 bg-slate-700 text-center flex flex-col justify-center items-center rounded-lg">
        <p className="text-[1.125rem]">{formattedDate.slice(0, 4)}</p>
        <p className="font-bold text-[1.25rem]"> {formattedDate.slice(-2)}</p>
      </div>
      <div className="flex-1">
        <p className="text-[1.25rem] font-medium">{city}</p>
        <div className="flex gap-2">
          <p className="w-max whitespace-nowrap">
            {dayOfWeek} {time}
          </p>
          <span>·</span>
          <p className="flex-grow whitespace-nowrap">{venue}</p>
        </div>
      </div>
    </div>
  );
}
