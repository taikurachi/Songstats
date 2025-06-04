"use client";
import { EventType, SongType } from "@/app/types/types";
import { fetchEvents } from "@/app/utilsFn/fetchEvents";
import { useEffect, useState } from "react";
import Event from "./Event";
import { motion } from "motion/react";

export default function Events({ songData }: { songData: SongType }) {
  const [artistEvents, setArtistEvents] = useState([]);
  const [artistIndex, setArtistIndex] = useState<number>(0);
  useEffect(() => {
    const fetchArtistEvents = async () => {
      const artistEvents = await fetchEvents(
        songData.artists[artistIndex].name
      );
      setArtistEvents(artistEvents);
    };
    fetchArtistEvents();
  }, [artistIndex, songData]);

  const handleSwitchArtist = () =>
    setArtistIndex((prev) => (prev + 1) % songData.artists.length);

  return (
    <div className="mt-20">
      <div className="flex justify-between">
        <h3 className="font-bold text-2xl">
          {`Events by `}
          <motion.span
            key={artistIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {songData.artists[artistIndex].name}
          </motion.span>
        </h3>
        {songData.artists.length > 1 && (
          <div
            className="flex items-center gap-4 hover:underline cursor-pointer"
            onClick={handleSwitchArtist}
          >
            Switch artist
          </div>
        )}
      </div>
      {artistEvents.length > 0 ? (
        <div className="grid grid-cols-3 ml-[-8px] mt-3">
          {artistEvents.map((event: EventType, index: number) => (
            <Event eventData={event} key={index} />
          ))}
        </div>
      ) : (
        <p className="mt-4 h-20">No upcoming events. Come back soon! :)</p>
      )}
    </div>
  );
}
