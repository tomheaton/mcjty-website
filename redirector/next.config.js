/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://www.mcjty.eu/',
        permanent: true,
      },
      {
        source: '/modding/:path*',
        destination: 'https://www.mcjty.eu/docs/intro/',
        permanent: true,
      },
      {
        source: '/mods/:path*',
        destination: 'https://www.mcjty.eu/docs/mods/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
