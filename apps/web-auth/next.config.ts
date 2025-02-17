import type { NextConfig } from "next";

const { NEXT_PUBLIC_AUTH_APP_URL } = process.env;

const nextConfig: NextConfig = {
  /* config options here */
  assetPrefix: "/auth-static",
  async rewrites() {
    return {
      beforeFiles: [
        // Handle direct static file requests
        // {
        //   source: "/_next/:path*",
        //   destination: `${NEXT_PUBLIC_AUTH_APP_URL}/_next/:path*`,
        // },
        // // Handle requests from other micro-frontends
        // {
        //   source: "/auth-static/_next/:path*",
        //   destination: `${NEXT_PUBLIC_AUTH_APP_URL}/_next/:path*`,
        // },
      ],
      fallback: [],
      afterFiles: [],
    };
  },
};

export default nextConfig;
