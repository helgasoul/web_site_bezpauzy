/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Отключаем ESLint во время сборки для bundle analyzer
  eslint: {
    ignoreDuringBuilds: process.env.ANALYZE === 'true',
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Хост из NEXT_PUBLIC_ASSETS_BASE_URL (Supabase через свой домен, CDN и т.п.)
      ...(function () {
        const u = process.env.NEXT_PUBLIC_ASSETS_BASE_URL
        if (!u || !u.startsWith('http')) return []
        try {
          const { protocol, hostname } = new URL(u)
          return [{ protocol: protocol.replace(':', ''), hostname, pathname: '/**' }]
        } catch {
          return []
        }
      })(),
    ],
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Для ngrok: добавляем заголовок для обхода предупреждающей страницы
  async rewrites() {
    return []
  },
  
  // Experimental: optimizeCss requires 'critters' — off to keep Vercel build reliable
  experimental: {
    optimizeCss: false,
  },
  
  transpilePackages: ['@supabase/supabase-js'],
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Отключаем HSTS в development для ngrok
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }] : []),
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development'
              ? [
                  // Более мягкие настройки для development (включая ngrok)
                  "default-src 'self' https://*.ngrok-free.app https://*.ngrok-free.dev https://*.ngrok.io",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.ngrok-free.app https://*.ngrok-free.dev https://*.ngrok.io https://*.supabase.co",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.ngrok-free.app https://*.ngrok-free.dev https://*.ngrok.io",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data: https://fonts.gstatic.com",
                  "connect-src 'self' https://*.supabase.co https://*.upstash.io https://*.ngrok-free.app https://*.ngrok-free.dev https://*.ngrok.io ws://localhost:* wss://localhost:*",
                  "frame-ancestors 'self' https://*.ngrok-free.app https://*.ngrok-free.dev https://*.ngrok.io",
                  "base-uri 'self' https://*.ngrok-free.app https://*.ngrok-free.dev https://*.ngrok.io",
                  "form-action 'self' https://*.ngrok-free.app https://*.ngrok-free.dev https://*.ngrok.io",
                  "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://*.mave.digital https://*.ngrok-free.app https://*.ngrok-free.dev https://*.ngrok.io",
                ].join('; ')
              : [
                  // Строгие настройки для production
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data: https://fonts.gstatic.com",
                  "connect-src 'self' https://*.supabase.co https://*.upstash.io",
                  "frame-ancestors 'self'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://*.mave.digital",
                ].join('; ')
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer, webpack }) => {
    // Fix for Supabase ESM modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    }
    
    // Better ESM support for Supabase
    config.resolve.conditionNames = ['require', 'node', 'default']
    
    // Handle node: protocol imports (e.g., node:crypto) - convert to regular imports
    const nodeAliases = {
      'node:crypto': 'crypto',
      'node:stream': 'stream',
      'node:url': 'url',
      'node:zlib': 'zlib',
      'node:http': 'http',
      'node:https': 'https',
      'node:assert': 'assert',
      'node:os': 'os',
      'node:path': 'path',
      'node:fs': 'fs',
      'node:net': 'net',
      'node:tls': 'tls',
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      ...nodeAliases,
    }
    
    if (!isServer) {
      // Client-side: exclude Node.js-only packages
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
      
      // Exclude Upstash packages and rate-limit from client bundle
      // These should only be used server-side (API routes, not middleware)
      config.resolve.alias = {
        ...config.resolve.alias,
        '@upstash/redis': false,
        '@upstash/ratelimit': false,
        '@/lib/rate-limit': false,
        'uncrypto': false,
      }
    } else {
      // Server-side: keep node: aliases but ensure they resolve correctly
      config.resolve.alias = {
        ...config.resolve.alias,
        ...nodeAliases,
      }
    }
    
    // Normalize node: protocol imports to regular Node.js modules
    config.plugins = config.plugins || []
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource) => {
          resource.request = resource.request.replace(/^node:/, '')
        }
      )
    )
    
    // Ignore Upstash packages and uncrypto in client bundle and middleware (Edge Runtime)
    // Middleware runs on Edge Runtime which doesn't support Node.js modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(@upstash\/(redis|ratelimit)|uncrypto)$/,
        contextRegExp: /middleware/,
      })
    )
    
    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(@upstash\/(redis|ratelimit)|uncrypto)$/,
        })
      )
    }
    
    // Handle ESM modules (including Supabase wrapper.mjs)
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    }
    
    // Ignore Supabase wrapper.mjs warnings and Upstash/crypto warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/supabase-js/ },
      { module: /node_modules\/@upstash/ },
      { module: /node_modules\/uncrypto/ },
      /Failed to parse source map/,
    ]
    
    return config
  },
}

// Bundle-analyzer только при ANALYZE=true; иначе не подключаем модуль вообще (важно для Vercel)
module.exports =
  process.env.ANALYZE === 'true'
    ? (() => {
        try {
          const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true })
          return withBundleAnalyzer(nextConfig)
        } catch {
          return nextConfig
        }
      })()
    : nextConfig

