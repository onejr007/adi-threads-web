/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/v1/threads/:path*',
        destination: 'http://adi_threads_service:8002/api/v1/threads/:path*',
      },
      {
        source: '/auth/oauth/:path*',
        destination: 'http://adi_threads_service:8002/auth/oauth/:path*',
      },
    ];
  },
};

export default nextConfig;
