// Secure storage hook with integrity checks
import { useState, useEffect, useCallback } from 'react';
import { DataIntegrityService } from '@/services/dataIntegrityService';
import { AuditService } from '@/services/auditService';

export function useSecureStorage<T>(
  key: string,
  initialValue: T,
  options: {
    encrypt?: boolean;
    validateIntegrity?: boolean;
  } = {}
): [T, (value: T) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value
  useEffect(() => {
    try {
      if (options.validateIntegrity) {
        const value = DataIntegrityService.getSecureData<T>(key);
        if (value !== null) {
          setStoredValue(value);
        }
      } else {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = options.encrypt 
            ? JSON.parse(DataIntegrityService.decryptData(item))
            : JSON.parse(item);
          setStoredValue(parsed);
        }
      }
    } catch (error) {
      console.warn(`Error loading from localStorage key "${key}":`, error);
      AuditService.logEvent({
        type: 'error',
        action: 'secure_storage_read_error',
        details: { key, error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'medium'
      });
    } finally {
      setIsLoading(false);
    }
  }, [key, options.encrypt, options.validateIntegrity]);

  // Set value function
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      
      if (options.validateIntegrity) {
        DataIntegrityService.setSecureData(key, value);
      } else if (options.encrypt) {
        const encrypted = DataIntegrityService.encryptData(JSON.stringify(value));
        localStorage.setItem(key, encrypted);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }

      // Log sensitive storage operations
      if (key.includes('auth') || key.includes('session') || key.includes('favorites')) {
        AuditService.logEvent({
          type: 'data',
          action: 'secure_storage_write',
          details: { key, encrypted: !!options.encrypt, integrity: !!options.validateIntegrity },
          severity: 'low'
        });
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
      AuditService.logEvent({
        type: 'error',
        action: 'secure_storage_write_error',
        details: { key, error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'medium'
      });
    }
  }, [key, options.encrypt, options.validateIntegrity]);

  return [storedValue, setValue, isLoading];
}