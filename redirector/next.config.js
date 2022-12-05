/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/modding',
        destination: 'https://www.mcjty.eu/docs/intro/',
        permanent: true,
      },
      {
        source: '/mods',
        destination: 'https://www.mcjty.eu/docs/mods/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
