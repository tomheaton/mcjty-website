import type { NextConfig } from "next";

export default {
  reactStrictMode: true,
  // redirects: async () => [
  //   {
  //     source: "/:path*",
  //     destination: "https://www.mcjty.eu/",
  //     permanent: true,
  //   },
  //   {
  //     source: "/modding/:path*",
  //     destination: "https://www.mcjty.eu/docs/intro/",
  //     permanent: true,
  //   },
  //   {
  //     source: "/mods/:path*",
  //     destination: "https://www.mcjty.eu/docs/mods/",
  //     permanent: true,
  //   },
  // ],
} satisfies NextConfig;
