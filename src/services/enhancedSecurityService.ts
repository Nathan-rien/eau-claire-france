// Enhanced security service with comprehensive protection
import { SecurityService } from './securityService';

export class EnhancedSecurityService extends SecurityService {
  // Enhanced input sanitization with XSS protection
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .slice(0, 1000);
  }

  // Enhanced HTML sanitization
  static sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Enhanced password validation
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 2;
    else feedback.push('Au moins 8 caractères requis');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Au moins une minuscule requise');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Au moins une majuscule requise');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Au moins un chiffre requis');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2;
    else feedback.push('Au moins un caractère spécial recommandé');

    if (password.length >= 12) score += 1;

    return {
      isValid: score >= 5,
      score: Math.min(score, 8),
      feedback
    };
  }

  // Content Security Policy validation
  static validateCSP(): boolean {
    const metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    return !!metaTag;
  }

  // Session security check
  static validateSession(): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    if (!window.isSecureContext) {
      issues.push('Non-secure context detected');
    }

    const lastActivity = localStorage.getItem('last_activity');
    if (lastActivity && this.isSessionExpired(parseInt(lastActivity))) {
      issues.push('Session expired');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Enhanced rate limiting with multiple strategies
  static checkAdvancedRateLimit(
    key: string,
    config: {
      requests: number;
      window: number;
      burst?: number;
      burstWindow?: number;
    }
  ): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    
    try {
      const data = localStorage.getItem(storageKey);
      const history = data ? JSON.parse(data) : [];
      
      const validHistory = history.filter((time: number) => 
        now - time < config.window
      );
      
      if (config.burst && config.burstWindow) {
        const burstHistory = validHistory.filter((time: number) => 
          now - time < config.burstWindow
        );
        
        if (burstHistory.length >= config.burst) {
          return { 
            allowed: false, 
            retryAfter: config.burstWindow - (now - Math.min(...burstHistory))
          };
        }
      }
      
      if (validHistory.length >= config.requests) {
        return { 
          allowed: false, 
          retryAfter: config.window - (now - Math.min(...validHistory))
        };
      }
      
      validHistory.push(now);
      localStorage.setItem(storageKey, JSON.stringify(validHistory));
      
      return { allowed: true };
    } catch (error) {
      return { allowed: true };
    }
  }

  // Security monitoring (simplified — no monkey-patching)
  static startSecurityMonitoring(): void {
    // No-op: monkey-patching console.log and localStorage removed
    // to eliminate main-thread overhead and potential recursion
  }

  // Generate security report
  static generateSecurityReport(): {
    timestamp: number;
    csp: boolean;
    session: { isValid: boolean; issues: string[] };
    storageHealth: { valid: number; corrupted: number };
    recommendations: string[];
  } {
    const session = this.validateSession();
    
    const recommendations: string[] = [];
    
    if (!this.validateCSP()) {
      recommendations.push('Implement Content Security Policy headers');
    }
    
    if (!session.isValid) {
      recommendations.push('Review session security configuration');
    }

    return {
      timestamp: Date.now(),
      csp: this.validateCSP(),
      session,
      storageHealth: { valid: 0, corrupted: 0 },
      recommendations
    };
  }
}
