import type { NextConfig } from "next";

// Sur GitHub Pages, le site est servi sous /<nom-du-repo>.
// La variable est définie dans .github/workflows/deploy.yml ; en local elle est vide.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
