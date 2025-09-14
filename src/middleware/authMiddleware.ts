// Authentication and authorization middleware for API routes
import { supabase } from '@/integrations/supabase/client';
import { FLAGS, SECURITY_CONFIG } from '@/config/flags';
import { AuditService } from '@/services/auditService';

export interface AuthContext {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId?: string;
  sessionToken?: string;
}

/**
 * Rate limiting store (in-memory for client-side, should be Redis/DB for server)
 */
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  check(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // New window or expired
      this.store.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (record.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: limit - record.count };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

// Cleanup rate limit store every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000);
}

/**
 * Extract authentication context from request
 */
export const extractAuthContext = async (request: Request): Promise<AuthContext> => {
  try {
    // Check for admin token in headers (server-side only)
    const adminToken = request.headers.get('X-Admin-Token');
    const expectedToken = process.env.ADMIN_DASHBOARD_TOKEN;
    
    if (adminToken && expectedToken && adminToken === expectedToken) {
      return {
        isAuthenticated: true,
        isAdmin: true,
        userId: 'admin',
      };
    }

    // Check Supabase session
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        // In a real app, check user role from database
        // For now, assume admin if user exists
        return {
          isAuthenticated: true,
          isAdmin: true, // This should be checked from user profile/roles
          userId: user.id,
          sessionToken: token,
        };
      }
    }

    return { isAuthenticated: false, isAdmin: false };
  } catch (error) {
    console.error('Auth context extraction failed:', error);
    return { isAuthenticated: false, isAdmin: false };
  }
};

/**
 * Rate limiting middleware
 */
export const checkRateLimit = (
  clientIp: string, 
  isAdmin: boolean = false
): { allowed: boolean; remaining: number; limit: number } => {
  if (!FLAGS.FF_RATE_LIMITING) {
    return { allowed: true, remaining: 999, limit: 999 };
  }

  const limit = isAdmin ? SECURITY_CONFIG.RATE_LIMIT_ADMIN : SECURITY_CONFIG.RATE_LIMIT_DEFAULT;
  const result = rateLimitStore.check(clientIp, limit, SECURITY_CONFIG.RATE_LIMIT_WINDOW);

  if (!result.allowed) {
    // Log rate limit violation
    AuditService.logEvent({
      type: 'security',
      action: 'limit_exceeded',
      ip: clientIp,
      severity: 'medium',
      details: { limit, isAdmin }
    });
  }

  return { ...result, limit };
};

/**
 * Admin route protection
 */
export const requireAdmin = (authContext: AuthContext): boolean => {
  if (!authContext.isAuthenticated || !authContext.isAdmin) {
    AuditService.logEvent({
      type: 'security',
      action: 'unauthorized_admin_access',
      userId: authContext.userId,
      severity: 'high',
      details: { 
        authenticated: authContext.isAuthenticated,
        admin: authContext.isAdmin 
      }
    });
    return false;
  }
  return true;
};

/**
 * Debug route protection
 */
export const requireDebugAccess = (authContext: AuthContext): boolean => {
  if (!FLAGS.FF_DEBUG_ROUTES) {
    return false;
  }
  
  // Debug routes require admin in production
  if (process.env.NODE_ENV === 'production') {
    return requireAdmin(authContext);
  }
  
  return true; // Allow in development
};

/**
 * Get client IP from request (handles various proxy headers)
 */
export const getClientIp = (request: Request): string => {
  // Try various headers that proxies/CDNs might set
  const headers = [
    'cf-connecting-ip', // Cloudflare
    'x-forwarded-for',  // Standard proxy header
    'x-real-ip',        // Nginx
    'x-client-ip',      // Some proxies
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can be a comma-separated list, take the first one
      return value.split(',')[0].trim();
    }
  }

  // Fallback to a default IP (in client-side context, this won't work)
  return '127.0.0.1';
};

/**
 * Log security event
 */
export const logSecurityEvent = (
  type: string,
  action: string,
  context: {
    ip?: string;
    userId?: string;
    userAgent?: string;
    path?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    details?: any;
  }
) => {
  AuditService.logEvent({
    type: type as 'security' | 'data' | 'error' | 'auth',
    action,
    ip: context.ip,
    userId: context.userId,
    userAgent: context.userAgent,
    severity: context.severity || 'medium',
    details: {
      path: context.path,
      ...context.details
    }
  });
};