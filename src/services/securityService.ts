
// Security service for input validation and sanitization
export class SecurityService {
  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .slice(0, 1000); // Limit length
  }

  // Email validation with normalization
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  // Normalize email (lowercase, trim)
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  // Password strength validation
  static isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /(?=.*[a-z])/.test(password) &&
      /(?=.*[A-Z])/.test(password) &&
      /(?=.*\d)/.test(password)
    );
  }

  // Rate limiting (client-side basic implementation)
  static checkRateLimit(key: string, limitMs: number = 60000): boolean {
    const lastAttempt = localStorage.getItem(`rate_limit_${key}`);
    const now = Date.now();
    
    if (lastAttempt && now - parseInt(lastAttempt) < limitMs) {
      return false; // Rate limited
    }
    
    localStorage.setItem(`rate_limit_${key}`, now.toString());
    return true; // Not rate limited
  }

  // Validate commune name
  static isValidCommune(commune: string): boolean {
    return (
      commune.length >= 1 &&
      commune.length <= 100 &&
      /^[a-zA-ZÀ-ÿ\s\-']+$/.test(commune)
    );
  }

  // Generate secure headers for API requests
  static getSecureHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Protection': '1',
    };
  }

  // Session timeout check (30 minutes)
  static isSessionExpired(lastActivity: number): boolean {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    return Date.now() - lastActivity > SESSION_TIMEOUT;
  }

  // Store last activity for session management
  static updateLastActivity(): void {
    localStorage.setItem('last_activity', Date.now().toString());
  }

  // Secure error logging (production-ready)
  static logSecurityEvent(event: string, details?: any): void {
    // Only log in development mode - remove sensitive data logging in production
    if (process.env.NODE_ENV === 'development') {
      const sanitizedDetails = details ? { type: typeof details, hasData: !!details } : null;
      console.warn(`[SECURITY EVENT] ${event}`, sanitizedDetails);
    }
    
    // In production, send to secure audit service (implement as needed)
    // Example: await supabase.functions.invoke('audit-log', { body: { event, timestamp: Date.now() } });
  }
}
