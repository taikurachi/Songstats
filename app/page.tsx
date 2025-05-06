"use client";
import Link from "next/link";
import Image from "next/image";
import Icon from "./components/utils/Icon";
import MainSearch from "./components/mainSearch/MainSearch";
import WaveBackground from "./components/utils/WaveBackground";
export default function Home() {
  return (
    <>
      <WaveBackground />
      <header className="p-8 h-[110px] flex items-center">
        <nav className="flex justify-between w-full max-w-[1800px] mx-auto">
          <Link href="/">
            <Image
              src="/spotify-logo.svg"
              width={130}
              height={80}
              alt="spotify logo"
            />
          </Link>
          <Link
            href="/"
            className="flex gap-4 items-center hover:opacity-100 opacity-80 transition-opacity"
          >
            <Icon variant="download" size={25} />
            <p className="font-medium">Get Spotify</p>
          </Link>
        </nav>
      </header>
      <MainSearch />
    </>
  );
}
