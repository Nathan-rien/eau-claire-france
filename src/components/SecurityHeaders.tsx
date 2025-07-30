// Security headers component for CSP and other security measures
import { Helmet } from 'react-helmet-async';

const SecurityHeaders = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Content Security Policy - more permissive in development
  const cspDirectives = isDevelopment ? {
    'default-src': "'self' 'unsafe-inline' 'unsafe-eval'",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval' *.mapbox.com blob:",
    'style-src': "'self' 'unsafe-inline' *.mapbox.com",
    'img-src': "'self' data: blob: *.mapbox.com",
    'connect-src': "'self' *.supabase.co *.mapbox.com",
    'font-src': "'self' data:",
    'worker-src': "'self' blob:",
    'frame-src': "'none'"
  } : {
    'default-src': "'self'",
    'script-src': "'self' *.mapbox.com blob:",
    'style-src': "'self' 'unsafe-inline' *.mapbox.com",
    'img-src': "'self' data: *.mapbox.com",
    'connect-src': "'self' *.supabase.co *.mapbox.com",
    'font-src': "'self'",
    'object-src': "'none'",
    'frame-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'worker-src': "'self' blob:"
  };

  const cspString = Object.entries(cspDirectives)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');

  return (
    <Helmet>
      {/* Content Security Policy */}
      <meta httpEquiv="Content-Security-Policy" content={cspString} />
      
      {/* Additional Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
      
      {/* HTTPS enforcement in production */}
      {!isDevelopment && (
        <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains" />
      )}
    </Helmet>
  );
};

export default SecurityHeaders;