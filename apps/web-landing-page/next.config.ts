import type { NextConfig } from "next";

const { NEXT_PUBLIC_MAIN_APP_URL, NEXT_PUBLIC_MAIN_AUTH_APP_URL } = process.env;

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@shared/ui"],
  redirects: async () => {
    return [
      {
        source: "/dashboard",
        destination: `${NEXT_PUBLIC_MAIN_APP_URL}/dashboard`,
        permanent: true,
      },
      {
        source: "/sign-in",
        destination: `${NEXT_PUBLIC_MAIN_AUTH_APP_URL}/sign-in`,
        permanent: true,
      },
      {
        source: "/sign-up",
        destination: `${NEXT_PUBLIC_MAIN_AUTH_APP_URL}/sign-up`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
