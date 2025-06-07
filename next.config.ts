import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.scdn.co", "i.ytimg.com"],
    unoptimized: true,
  },
};

export default nextConfig;
