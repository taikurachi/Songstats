"use client";
import convertToRGB from "@/app/utilsFn/colorFn/convertToRGB";
import Link from "next/link";

type RelatedMediaLinkProps = {
  dominantColor: number[];
  id: string;
};

export default function RelatedMediaLink({
  dominantColor,
  id,
}: RelatedMediaLinkProps) {
  return (
    <Link
      href={`/songs/${id}/related`}
      className="flex-1 p-4 rounded-lg text-xl font-bold cursor-pointer"
      style={{ background: convertToRGB(dominantColor) }}
    >
      Related Media
    </Link>
  );
}
