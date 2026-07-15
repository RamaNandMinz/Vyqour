import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    externalDir: true,
  },
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ["localhost", "vyqour-app.com"],
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;