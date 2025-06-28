import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { TokenProvider } from "./context/tokenContext";
import QueryProvider from "./components/providers/QueryProvider";

const spotifyMix = localFont({
  src: [
    {
      path: "./fonts/SpotifyMix-Regular.ttf",
      weight: "400",
    },
    {
      path: "./fonts/SpotifyMix-Medium.ttf",
      weight: "500",
    },
    {
      path: "./fonts/SpotifyMix-Bold.ttf",
      weight: "700",
    },
    {
      path: "./fonts/SpotifyMix-Extrabold.ttf",
      weight: "800",
    },
    {
      path: "./fonts/SpotifyMix-Black.ttf",
      weight: "900",
    },
  ],
  variable: "--font-spotifyMix",
});

export const metadata: Metadata = {
  title: "Songstats",
  description: "Song data visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spotifyMix.variable} font-sans antialiased1`}>
        <QueryProvider>
          <TokenProvider>{children}</TokenProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
