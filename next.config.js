import "./lib/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true, // Ignore eslint errors during build
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
