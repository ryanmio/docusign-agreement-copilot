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
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.docusign.com https://*.docusign.net https://unpkg.com https://docucdn-a.akamaihd.net https://a.docusign.com https://songbirdstag.cardinalcommerce.com https://protect-d.docusign.net https://docusign-api.arkoselabs.com https://cdn.cookielaw.org;
              frame-src 'self' https://*.docusign.com https://*.docusign.net;
              frame-ancestors 'self' https://*.docusign.com https://*.docusign.net;
              connect-src 'self' https://*.docusign.com https://*.docusign.net https://unpkg.com https://*.supabase.co;
              style-src 'self' 'unsafe-inline' https://*.docusign.com https://*.docusign.net;
              img-src 'self' data: blob: https://*.docusign.net https://*.docusign.com;
              worker-src 'self' blob: https://*.docusign.net https://*.docusign.com;
              font-src 'self' data: https://*.docusign.net https://*.docusign.com;
              form-action 'self' https://*.docusign.net https://*.docusign.com;
              object-src 'none';
              base-uri 'self';
              child-src 'self' https://*.docusign.com https://*.docusign.net;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;
