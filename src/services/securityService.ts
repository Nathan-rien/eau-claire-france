
// Security service for input validation and sanitization
export class SecurityService {
  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .slice(0, 1000); // Limit length
  }

  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
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
    };
  }

  // Log security events (for audit purposes)
  static logSecurityEvent(event: string, details?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    // In production, this should send to a secure logging service
    console.log('[SECURITY LOG]', logEntry);
  }
}
