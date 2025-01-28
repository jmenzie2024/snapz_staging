/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  env: {   
     API_URL: process.env.API_URL,
  },
};

module.exports = nextConfig;
