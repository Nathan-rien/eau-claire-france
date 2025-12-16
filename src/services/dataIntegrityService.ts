// Data storage service for client-side localStorage operations
// Note: Client-side storage cannot be truly "secure" - this provides convenience, not security

export class DataIntegrityService {
  private static readonly STORAGE_PREFIX = 'infoeau_';

  // Store data with timestamp for expiry checking
  static setData(key: string, data: any, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
    try {
      const storedData = {
        data,
        timestamp: Date.now(),
        maxAge: maxAgeMs
      };
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(storedData));
    } catch (error) {
      console.warn('Failed to store data:', error);
    }
  }

  // Retrieve data with expiry check
  static getData<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!stored) return null;

      const { data, timestamp, maxAge } = JSON.parse(stored);
      
      // Check if data has expired
      if (maxAge && Date.now() - timestamp > maxAge) {
        localStorage.removeItem(this.STORAGE_PREFIX + key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to retrieve data:', error);
      return null;
    }
  }

  // Remove data
  static removeData(key: string): void {
    try {
      localStorage.removeItem(this.STORAGE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove data:', error);
    }
  }

  // Legacy compatibility methods (no longer use encryption/checksums)
  static setSecureData(key: string, data: any): void {
    this.setData(key, data);
  }

  static getSecureData<T>(key: string): T | null {
    return this.getData<T>(key);
  }

  // Verify storage health (simplified - just checks if items exist and are valid JSON)
  static verifyAllData(): { valid: number; corrupted: number; keys: string[] } {
    const result = { valid: 0, corrupted: 0, keys: [] as string[] };
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(this.STORAGE_PREFIX)) continue;

      try {
        const item = localStorage.getItem(key);
        if (item) {
          JSON.parse(item);
          result.valid++;
        }
      } catch {
        result.corrupted++;
        result.keys.push(key);
      }
    }

    return result;
  }
}
