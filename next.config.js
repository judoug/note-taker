/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers for production
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          // HTTPS Enforcement
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.openai.com https://clerk.com https://*.clerk.accounts.dev https://*.neon.tech wss://*.clerk.accounts.dev",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // MIME Type Sniffing Protection
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Clickjacking Protection
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'accelerometer=()',
              'gyroscope=()'
            ].join(', ')
          }
        ]
      }
    ];
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Development-only settings
  ...(process.env.NODE_ENV === 'development' && {
    // Allow localhost in development
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: '/api/:path*'
        }
      ];
    }
  })
};

module.exports = nextConfig;
