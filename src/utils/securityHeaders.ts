// Security headers configuration and utilities
import { FLAGS, SECURITY_CONFIG } from '@/config/flags';

/**
 * Generate Content Security Policy header value
 */
export const generateCSP = (): string => {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.supabase.co https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob:",
    "connect-src 'self' https://*.supabase.co https://api.mapbox.com wss://*.supabase.co",
    "worker-src 'self' blob:",
    "frame-src 'self' https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
  ];

  return directives.join('; ');
};

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSP(),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS Protection
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (restrict browser features)
  'Permissions-Policy': [
    'camera=()',
    'geolocation=(self)',
    'microphone=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
  ].join(', '),
  
  // HSTS (only for HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Prevent MIME sniffing
  'X-DNS-Prefetch-Control': 'off',
  
  // Remove server info
  'X-Powered-By': '',
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  'Access-Control-Allow-Origin': SECURITY_CONFIG.ALLOWED_ORIGINS.join(' '), // Will be set dynamically
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Admin-Token',
    'X-Client-Info',
    'apikey'
  ].join(', '),
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Apply security headers to a Response object
 */
export const applySecurityHeaders = (response: Response, request?: Request): Response => {
  if (!FLAGS.FF_SECURITY_HEADERS) {
    return response;
  }

  const headers = new Headers(response.headers);
  
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (value) {
      headers.set(key, value);
    }
  });

  // Apply CORS headers with origin validation
  if (request) {
    const origin = request.headers.get('origin');
    if (origin && SECURITY_CONFIG.ALLOWED_ORIGINS.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin);
    }
  }

  // Apply other CORS headers
  Object.entries(CORS_CONFIG).forEach(([key, value]) => {
    if (key !== 'Access-Control-Allow-Origin' && value) {
      headers.set(key, value);
    }
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

/**
 * Create security headers for HTML meta tags
 */
export const getMetaSecurityTags = (isAdminPage = false) => [
  // Basic security
  { name: 'referrer', content: 'strict-origin-when-cross-origin' },
  { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
  { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
  
  // Admin pages should not be indexed
  ...(isAdminPage ? [
    { name: 'robots', content: 'noindex,nofollow,noarchive,nosnippet,notranslate' },
    { name: 'googlebot', content: 'noindex,nofollow' },
  ] : []),
  
  // Content Security Policy (if not already set by server)
  { 'http-equiv': 'Content-Security-Policy', content: generateCSP() },
];

/**
 * Validate that required security headers are present
 */
export const validateSecurityHeaders = (headers: HeadersInit | Headers): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} => {
  const headerMap = new Map();
  
  if (headers instanceof Headers) {
    headers.forEach((value, key) => headerMap.set(key.toLowerCase(), value));
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => headerMap.set(key.toLowerCase(), value));
  } else {
    Object.entries(headers).forEach(([key, value]) => headerMap.set(key.toLowerCase(), value));
  }

  const required = [
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
  ];

  const missing = required.filter(header => !headerMap.has(header));
  const warnings: string[] = [];

  // Check for insecure values
  if (headerMap.get('x-frame-options') === 'ALLOWALL') {
    warnings.push('X-Frame-Options should not be ALLOWALL');
  }

  if (headerMap.get('content-security-policy')?.includes("'unsafe-eval'")) {
    warnings.push('CSP contains unsafe-eval directive');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
};