// Data integrity service for client-side storage protection
import CryptoJS from 'crypto-js';

export class DataIntegrityService {
  private static readonly INTEGRITY_KEY = 'data_integrity';
  private static readonly SECRET_KEY = 'InfoEau2024SecureKey';

  // Generate checksum for data
  static generateChecksum(data: any): string {
    const serialized = JSON.stringify(data);
    return CryptoJS.SHA256(serialized + this.SECRET_KEY).toString();
  }

  // Store data with integrity check
  static setSecureData(key: string, data: any): void {
    try {
      const checksum = this.generateChecksum(data);
      const secureData = {
        data,
        checksum,
        timestamp: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(secureData));
      
      // Store integrity mapping
      this.updateIntegrityMap(key, checksum);
    } catch (error) {
      console.warn('Failed to store secure data:', error);
    }
  }

  // Retrieve data with integrity verification
  static getSecureData<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const { data, checksum, timestamp } = JSON.parse(stored);
      
      // Verify checksum
      const expectedChecksum = this.generateChecksum(data);
      if (checksum !== expectedChecksum) {
        console.warn(`Data integrity check failed for key: ${key}`);
        this.handleIntegrityViolation(key);
        return null;
      }

      // Check if data is too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to retrieve secure data:', error);
      return null;
    }
  }

  // Encrypt sensitive data (if needed)
  static encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
  }

  // Decrypt sensitive data
  static decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.warn('Failed to decrypt data:', error);
      return '';
    }
  }

  // Update integrity mapping
  private static updateIntegrityMap(key: string, checksum: string): void {
    try {
      const map = this.getIntegrityMap();
      map[key] = checksum;
      localStorage.setItem(this.INTEGRITY_KEY, JSON.stringify(map));
    } catch (error) {
      console.warn('Failed to update integrity map:', error);
    }
  }

  // Get integrity mapping
  private static getIntegrityMap(): Record<string, string> {
    try {
      const map = localStorage.getItem(this.INTEGRITY_KEY);
      return map ? JSON.parse(map) : {};
    } catch (error) {
      return {};
    }
  }

  // Handle integrity violation
  private static handleIntegrityViolation(key: string): void {
    // Log security event
    import('./auditService').then(({ AuditService }) => {
      AuditService.logEvent({
        type: 'security',
        action: 'data_integrity_violation',
        details: { key },
        severity: 'high'
      });
    });

    // Remove corrupted data
    localStorage.removeItem(key);
  }

  // Verify all stored data integrity
  static verifyAllData(): { valid: number; corrupted: number; keys: string[] } {
    const result = { valid: 0, corrupted: 0, keys: [] as string[] };
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || key === this.INTEGRITY_KEY) continue;

      try {
        const data = this.getSecureData(key);
        if (data !== null) {
          result.valid++;
        } else {
          result.corrupted++;
          result.keys.push(key);
        }
      } catch (error) {
        result.corrupted++;
        result.keys.push(key);
      }
    }

    return result;
  }
}