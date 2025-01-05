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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.docusign.com https://*.docusign.net https://docucdn-a.akamaihd.net https://docutest-a.akamaihd.net https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://*.docusign.com https://*.docusign.net https://docucdn-a.akamaihd.net",
              "img-src 'self' data: blob: https://*.docusign.com https://*.docusign.net https://docucdn-a.akamaihd.net",
              "connect-src 'self' https://*.docusign.com https://*.docusign.net https://docucdn-a.akamaihd.net https://unpkg.com",
              "frame-src 'self' https://*.docusign.com https://*.docusign.net https://docucdn-a.akamaihd.net",
              "frame-ancestors 'self' https://*.docusign.com https://*.docusign.net https://docucdn-a.akamaihd.net",
              "worker-src 'self' blob: https://*.docusign.com https://*.docusign.net https://docucdn-a.akamaihd.net https://docutest-a.akamaihd.net",
              "child-src 'self' blob: https://*.docusign.com https://*.docusign.net https://docucdn-a.akamaihd.net"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
