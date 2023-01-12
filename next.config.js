/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  scope: "/",
});

const nextConfig = withPWA({
  experimental: {
    appDir: true,
  },
  swcMinify: true,
});

module.exports = nextConfig;
