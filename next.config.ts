import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mynutriapps.s3.ap-southeast-5.amazonaws.com"
      },
      {
        protocol: "https",
        hostname: "openfoodfacts-images.s3.eu-west-3.amazonaws.com"
      }
    ]
  },
  serverExternalPackages: []
};

export default nextConfig;
