/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  assetPrefix: "/app-static",
  async rewrites() {
    return {
      beforeFiles: [
        // This rewrite is necessary to support assetPrefix only in Next 14 and below.
        // It is not necessary in Next 15.
        {
          source: "/app-static/_next/:path*",
          destination: "/_next/:path*",
        },
      ],
    };
  },
  // redirects: async () => { // UNCOMMENT FOR MICROSERVICE REDIRECTS ON FRONTEND
  //   return [
  //     {
  //       source: "/sign-in",
  //       destination: `${NEXT_PUBLIC_AUTH_APP_URL}/sign-in`,
  //       permanent: false,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
