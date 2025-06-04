import { EventType } from "@/app/types/types";
import Link from "next/link";

export default function Event({ eventData }: { eventData: EventType }) {
  console.log(eventData);
  const date = new Date(
    eventData.dates.start?.dateTime ?? eventData.dates.start.localDate
  );
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
  const city = eventData._embedded?.venues[0].city?.name ?? "TBD";
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
  const venue = eventData._embedded?.venues[0].name;

  return (
    <Link href={eventData.url}>
      <div className="flex items-center gap-4 overflow-hidden hover:bg-slate-500 p-2 rounded-lg">
        <div className="p-2 pr-4 pl-4 bg-slate-700 text-center flex flex-col justify-center items-center rounded-lg w-20">
          <p className="text-[1.25rem]">{formattedDate.slice(0, 4)}</p>
          <p className="font-bold text-[1.4rem]"> {formattedDate.slice(-2)}</p>
        </div>
        <div className="flex-1">
          <p className="text-[1.25rem] font-medium">{city}</p>
          <div className="flex gap-2">
            <p className="w-max whitespace-nowrap">
              {dayOfWeek} {time}
            </p>
            {venue && (
              <>
                <span>·</span>
                <p className="flex-grow whitespace-nowrap">{venue}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
