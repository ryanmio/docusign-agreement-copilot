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
        source: '/api/webhooks/docusign',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.docusign.net https://*.docusign.com https://unpkg.com https://docucdn-a.akamaihd.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.docusign.net https://*.docusign.com",
              "font-src 'self' data:",
              "frame-src 'self' https://*.docusign.net https://*.docusign.com",
              "frame-ancestors 'self' https://*.docusign.net https://*.docusign.com",
              "connect-src 'self' https://*.docusign.net https://*.docusign.com https://*.supabase.co wss://*.supabase.co https://unpkg.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
        ],
      }
    ];
  },
};

module.exports = nextConfig;
