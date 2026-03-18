/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ecommerce-backend-production-aa2e.up.railway.app',
        port: '',       // kosong kalau default 443
        pathname: '/**', // semua path di domain itu
      },
    ],
  },
};

export default nextConfig;
