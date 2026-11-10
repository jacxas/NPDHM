const rawBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim();
const basePath =
  rawBasePath && rawBasePath !== "/"
    ? (rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`).replace(/\/+$/, "")
    : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  ...(basePath ? { basePath } : {}),
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/dmca.html", destination: "/dmca", permanent: true },
      { source: "/site-request.html", destination: "/request", permanent: true },
    ];
  },
};

export default nextConfig;
