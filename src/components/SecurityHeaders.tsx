// Security headers component - CSP disabled client-side to avoid blocking legitimate scripts
// Real CSP should be set server-side via HTTP headers, not meta tags
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SecurityHeaders = React.memo(() => {
  return (
    <Helmet>
      {/* Non-blocking security headers only */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
    </Helmet>
  );
});

SecurityHeaders.displayName = 'SecurityHeaders';

export default SecurityHeaders;
