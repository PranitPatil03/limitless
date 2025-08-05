import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/aws/get-file-url/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/api/aws/get-file-url/**",
      },
    ],
  },
};

export default nextConfig;
