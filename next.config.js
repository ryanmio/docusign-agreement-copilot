/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.docusign.net https://*.docusign.com https://unpkg.com https://docucdn-a.akamaihd.net https://*.vercel.app https://vercel.live https://*.vercel.sh",
              "style-src 'self' 'unsafe-inline' https://vercel.live",
              "img-src 'self' data: blob: https://*.docusign.net https://*.docusign.com https://*.w3.org https://vercel.live https://vercel.com",
              "font-src 'self' data: https://vercel.live https://assets.vercel.com",
              "frame-src 'self' https://*.docusign.net https://*.docusign.com https://vercel.live https://*.vercel.live https://*.vercel.app",
              "frame-ancestors 'self' https://*.docusign.net https://*.docusign.com https://vercel.live https://*.vercel.live https://*.vercel.app",
              "connect-src 'self' https://*.docusign.net https://*.docusign.com https://*.supabase.co wss://*.supabase.co https://unpkg.com https://ahynitsoacoisrgodqqq.supabase.co https://*.w3.org https://www.w3.org https://*.vercel.app https://vercel.live https://*.vercel.sh wss://ws-us3.pusher.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
        ],
      }
    ];
  }
};

module.exports = nextConfig;
