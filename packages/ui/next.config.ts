import type { NextConfig } from "next";

const { NEXT_PUBLIC_MAIN_APP_URL } = process.env;

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  rewrites: async () => {
    return [
      {
        source: "/dasboard",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/dasboard`,
      },
    ];
  },
};

export default nextConfig;
