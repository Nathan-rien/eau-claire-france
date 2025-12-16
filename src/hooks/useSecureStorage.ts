// Storage hook with optional expiry
import { useState, useEffect, useCallback } from 'react';
import { DataIntegrityService } from '@/services/dataIntegrityService';
import { AuditService } from '@/services/auditService';

export function useSecureStorage<T>(
  key: string,
  initialValue: T,
  options: {
    validateIntegrity?: boolean; // Legacy option - now just uses standard storage
    maxAgeMs?: number; // Optional expiry in milliseconds
  } = {}
): [T, (value: T) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value
  useEffect(() => {
    try {
      const value = DataIntegrityService.getData<T>(key);
      if (value !== null) {
        setStoredValue(value);
      }
    } catch (error) {
      console.warn(`Error loading from localStorage key "${key}":`, error);
      AuditService.logEvent({
        type: 'error',
        action: 'storage_read_error',
        details: { key, error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'medium'
      });
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Set value function
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      DataIntegrityService.setData(key, value, options.maxAgeMs);

      // Log sensitive storage operations
      if (key.includes('auth') || key.includes('session') || key.includes('favorites')) {
        AuditService.logEvent({
          type: 'data',
          action: 'storage_write',
          details: { key },
          severity: 'low'
        });
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
      AuditService.logEvent({
        type: 'error',
        action: 'storage_write_error',
        details: { key, error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'medium'
      });
    }
  }, [key, options.maxAgeMs]);

  return [storedValue, setValue, isLoading];
}
