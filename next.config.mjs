/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/mobile',
        permanent: true,
      },
      {
        source: '/app/:path*',
        destination: '/mobile/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
