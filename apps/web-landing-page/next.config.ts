import type { NextConfig } from "next";

const { NEXT_PUBLIC_MAIN_APP_URL, NEXT_PUBLIC_MAIN_AUTH_APP_URL } = process.env;

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@shared/ui"],
  async rewrites() {
    return [
      /**
       * Rewrites for Multi-Zones
       */
      // MAIN APP MICRO FRONTEND REDIRECTS
      {
        source: "/app-static/:path*",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/app-static/:path*`,
      },
      {
        source: "/dashboard",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/dashboard`,
      },
      {
        source: "/analytics-dashboard",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/analytics-dashboard`,
      },
      {
        source: "/billing",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/billing`,
      },
      {
        source: "/projects",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/projects`,
      },
      {
        source: "/projects/:path*",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/projects/:path*`,
      },
      {
        source: "/workflow",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/workflow`,
      },
      {
        source: "/workflow/:path*",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/workflow/:path*`,
      },
      {
        source: "/workflow-list",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/workflow-list`,
      },
      {
        source: "/credentials",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/credentials`,
      },
      {
        source: "/generate-component",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/generate-component`,
      },
      {
        source: "/save-component",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/save-component`,
      },
      {
        source: "/setup",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/setup`,
      },
      // AUTH MICRO FRONTEND REDIRECTS
      // Auth static files handling
      {
        source: "/auth-static/_next/:path*",
        destination: `${NEXT_PUBLIC_MAIN_AUTH_APP_URL}/_next/:path*`,
      },
      {
        source: "/sign-in",
        destination: `${NEXT_PUBLIC_MAIN_AUTH_APP_URL}/sign-in`,
      },
      {
        source: "/sign-up",
        destination: `${NEXT_PUBLIC_MAIN_AUTH_APP_URL}/sign-up`,
      },
      {
        source: "/auth/:path*",
        destination: `${NEXT_PUBLIC_MAIN_AUTH_APP_URL}/auth/:path*`,
      },
    ];
  },
  // redirects: async () => { // UNCOMMENT FOR MICROSERVICE REDIRECTS ON FRONTEND
  //   return [
  //     {
  //       source: "/dashboard",
  //       destination: `${NEXT_PUBLIC_MAIN_APP_URL}/dashboard`,
  //       permanent: true,
  //     },
  //     {
  //       source: "/sign-in",
  //       destination: `${NEXT_PUBLIC_MAIN_AUTH_APP_URL}/sign-in`,
  //       permanent: true,
  //     },
  //     {
  //       source: "/sign-up",
  //       destination: `${NEXT_PUBLIC_MAIN_AUTH_APP_URL}/sign-up`,
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
