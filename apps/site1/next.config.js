/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:3000/api/auth/:path*', // Proxy to auth app
      },
    ]
  },
}
export default nextConfig;
