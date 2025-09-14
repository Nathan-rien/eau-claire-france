// Security and feature flags configuration
// Central configuration for environment-based feature toggles

// Environment detection
export const IS_PROD = import.meta.env.PROD || process.env.NODE_ENV === 'production';
export const IS_PREVIEW = import.meta.env.DEV && window?.location?.hostname?.includes?.('preview');
export const IS_DEV = import.meta.env.DEV && !IS_PREVIEW;

// Feature flags - Default values based on environment
const DEFAULT_FLAGS = {
  // Admin and debug features
  FF_ADMIN_UI: !IS_PROD, // Admin UI access
  FF_DEBUG_ROUTES: !IS_PROD, // Debug API routes
  FF_QUICKSTART: !IS_PROD, // QuickStart admin component
  FF_PUBLIC_TIMESERIES_API: true, // Public timeseries data access
  
  // Security features
  FF_RATE_LIMITING: true, // API rate limiting
  FF_SECURITY_HEADERS: true, // Security headers
  FF_AUDIT_LOGGING: true, // Audit logging
  
  // Cron and automation
  CRON_ENABLED: false, // Cron scheduler (manual activation required)
  
  // Debug and development
  FF_VERBOSE_LOGGING: IS_DEV, // Detailed console logging
  FF_SOURCE_MAPS: IS_DEV, // Generate source maps
};

// Override flags from environment variables (for runtime configuration)
const getEnvFlag = (key: string, defaultValue: boolean): boolean => {
  const envValue = import.meta.env[`VITE_${key}`];
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1';
  }
  return defaultValue;
};

// Export feature flags with environment overrides
export const FLAGS = {
  FF_ADMIN_UI: getEnvFlag('FF_ADMIN_UI', DEFAULT_FLAGS.FF_ADMIN_UI),
  FF_DEBUG_ROUTES: getEnvFlag('FF_DEBUG_ROUTES', DEFAULT_FLAGS.FF_DEBUG_ROUTES),
  FF_QUICKSTART: getEnvFlag('FF_QUICKSTART', DEFAULT_FLAGS.FF_QUICKSTART),
  FF_PUBLIC_TIMESERIES_API: getEnvFlag('FF_PUBLIC_TIMESERIES_API', DEFAULT_FLAGS.FF_PUBLIC_TIMESERIES_API),
  FF_RATE_LIMITING: getEnvFlag('FF_RATE_LIMITING', DEFAULT_FLAGS.FF_RATE_LIMITING),
  FF_SECURITY_HEADERS: getEnvFlag('FF_SECURITY_HEADERS', DEFAULT_FLAGS.FF_SECURITY_HEADERS),
  FF_AUDIT_LOGGING: getEnvFlag('FF_AUDIT_LOGGING', DEFAULT_FLAGS.FF_AUDIT_LOGGING),
  CRON_ENABLED: getEnvFlag('CRON_ENABLED', DEFAULT_FLAGS.CRON_ENABLED),
  FF_VERBOSE_LOGGING: getEnvFlag('FF_VERBOSE_LOGGING', DEFAULT_FLAGS.FF_VERBOSE_LOGGING),
  FF_SOURCE_MAPS: getEnvFlag('FF_SOURCE_MAPS', DEFAULT_FLAGS.FF_SOURCE_MAPS),
};

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_DEFAULT: 60, // requests per minute for regular users
  RATE_LIMIT_ADMIN: 600, // requests per minute for admin users
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute in milliseconds
  
  // Session management
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  // Admin access
  ADMIN_POSTAL_CODE: '75001', // Default postal code for store selection
  
  // CORS domains (production should override this)
  ALLOWED_ORIGINS: IS_PROD 
    ? ['https://infoeau.fr', 'https://www.infoeau.fr'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
};

// Utility functions
export const isFeatureEnabled = (flag: keyof typeof FLAGS): boolean => {
  return FLAGS[flag] as boolean;
};

export const getEnvironmentInfo = () => ({
  environment: IS_PROD ? 'production' : IS_PREVIEW ? 'preview' : 'development',
  activeFlags: Object.entries(FLAGS)
    .filter(([_, value]) => value === true)
    .map(([key]) => key),
  securityLevel: IS_PROD ? 'high' : 'medium',
});

// Debug helper (only in development)
if (IS_DEV && typeof window !== 'undefined') {
  (window as any).__FLAGS = FLAGS;
  (window as any).__ENV_INFO = getEnvironmentInfo();
  console.log('🏳️ Feature flags loaded:', FLAGS);
}