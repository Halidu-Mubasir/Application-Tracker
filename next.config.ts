import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Documents (transcripts, writing samples) are uploaded straight
    // through a server action rather than the Blob client-upload flow, so
    // raise the default 1MB body limit to something PDF-sized.
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
