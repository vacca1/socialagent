/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@postador/types"],

  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "@postador/database"],
  },

  // Proxy all external services through localhost:3000
  async rewrites() {
    return [
      // Video editor - proxy /video-editor/* → localhost:3002/*
      {
        source: "/video-editor",
        destination: "http://localhost:3002/",
      },
      {
        source: "/video-editor/:path*",
        destination: "http://localhost:3002/:path*",
      },
      // SocialFlow API - proxy /api/socialflow/* → localhost:8001/*
      {
        source: "/api/socialflow/:path*",
        destination: "http://localhost:8001/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
