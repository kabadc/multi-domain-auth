/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['site1.local'],
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
