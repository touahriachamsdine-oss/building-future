import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Image uploads travel through a server action. The default 1 MB cap
      // rejects almost every phone photo; Vercel caps a function request body
      // at 4.5 MB, so stay just below it. Client-side compression keeps the
      // real payload far smaller than this.
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
