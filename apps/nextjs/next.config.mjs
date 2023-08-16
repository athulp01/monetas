// Importing env files here to validate on build
import "./src/env.mjs";
import path from "node:path";
import url from "url";

const workspaceRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '..',
  '..'
);

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@monetas/api", "@monetas/db", "@monetas/importer"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asset.brandfetch.io',
      },
    ],
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: workspaceRoot,
    outputFileTracingIncludes: {
      '/api/*': ["../../packages/**/*"]
    }
  }
};

export default config;
