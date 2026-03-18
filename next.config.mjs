/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ecommerce-backend-production-aa2e.up.railway.app',
        port: '',       // kosong jika default 443
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
