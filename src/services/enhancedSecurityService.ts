// Enhanced security service with comprehensive protection
import { SecurityService } from './securityService';
import { AuditService } from './auditService';
import { DataIntegrityService } from './dataIntegrityService';

export class EnhancedSecurityService extends SecurityService {
  // Enhanced input sanitization with XSS protection
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      // Enhanced XSS protection
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      // Limit length
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
    
    // Check for secure storage
    if (!window.isSecureContext) {
      issues.push('Non-secure context detected');
    }

    // Check session timeout
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
      
      // Clean old entries
      const validHistory = history.filter((time: number) => 
        now - time < config.window
      );
      
      // Check burst limit if configured
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
      
      // Check regular limit
      if (validHistory.length >= config.requests) {
        return { 
          allowed: false, 
          retryAfter: config.window - (now - Math.min(...validHistory))
        };
      }
      
      // Allow request and update history
      validHistory.push(now);
      localStorage.setItem(storageKey, JSON.stringify(validHistory));
      
      return { allowed: true };
    } catch (error) {
      // Fail open for availability
      return { allowed: true };
    }
  }

  // Security monitoring
  static startSecurityMonitoring(): void {
    // Monitor for suspicious activities
    this.monitorLocalStorageChanges();
    this.monitorConsoleAccess();
    // Temporarily disable network monitoring to fix API calls
    // this.monitorNetworkRequests();
  }

  // Monitor localStorage changes
  private static monitorLocalStorageChanges(): void {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      // Log sensitive operations
      if (key.includes('auth') || key.includes('session')) {
        AuditService.logEvent({
          type: 'security',
          action: 'localStorage_sensitive_write',
          details: { key },
          severity: 'medium'
        });
      }
      return originalSetItem.call(this, key, value);
    };
  }

  // Monitor console access (development detection)
  private static monitorConsoleAccess(): void {
    if (process.env.NODE_ENV === 'production') {
      const originalLog = console.log;
      console.log = function(...args) {
        AuditService.logEvent({
          type: 'security',
          action: 'console_access_production',
          details: { argsCount: args.length },
          severity: 'medium'
        });
        return originalLog.apply(this, args);
      };
    }
  }

  // Monitor network requests
  private static monitorNetworkRequests(): void {
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : (input as Request).url;
      
      // Log external API calls but don't interfere with them
      if (!url.includes(window.location.hostname)) {
        try {
          AuditService.logEvent({
            type: 'security',
            action: 'external_api_call',
            details: { url: new URL(url).hostname },
            severity: 'low'
          });
        } catch (error) {
          // Silently fail if logging fails
        }
      }
      
      // Always call the original fetch without interference
      return originalFetch.call(this, input, init);
    };
  }

  // Generate security report
  static generateSecurityReport(): {
    timestamp: number;
    csp: boolean;
    session: { isValid: boolean; issues: string[] };
    dataIntegrity: { valid: number; corrupted: number; keys: string[] };
    auditSummary: any;
    recommendations: string[];
  } {
    const dataIntegrity = DataIntegrityService.verifyAllData();
    const session = this.validateSession();
    const auditSummary = AuditService.getSecuritySummary();
    
    const recommendations: string[] = [];
    
    if (!this.validateCSP()) {
      recommendations.push('Implement Content Security Policy headers');
    }
    
    if (!session.isValid) {
      recommendations.push('Review session security configuration');
    }
    
    if (dataIntegrity.corrupted > 0) {
      recommendations.push('Investigate data integrity violations');
    }
    
    if (auditSummary.suspiciousActivity) {
      recommendations.push('Review suspicious security activities');
    }

    return {
      timestamp: Date.now(),
      csp: this.validateCSP(),
      session,
      dataIntegrity,
      auditSummary,
      recommendations
    };
  }
}