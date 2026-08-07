// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true'
// });
/** @type {import('next').NextConfig} */
const path = require('path');
const API_HOST = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

const nextConfig = {
  // webpack: (config) => {
  //   config.resolve.fallback = { fs: false };
  //   return config;
  // },
  turbopack: {
    root: path.join(__dirname, '')
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    JWT_SECRET: process.env.JWT_SECRET
  },
 images: {
    remotePatterns: [
      {
        protocol: API_HOST.protocol.replace(':', ''),
        hostname: API_HOST.hostname,
        port: API_HOST.port || '',
        pathname: '/uploads/**'
      },
      { protocol: 'https', hostname: 'brillers.in', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }
    ]
  }

};

module.exports = nextConfig;
