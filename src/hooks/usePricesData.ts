import { useState, useEffect } from 'react';
import { getBrands, getRetailers, getPrices, getBrandStats } from '@/services/pricesApi';
import { PriceFilters, PaginatedResponse, Price, BrandPriceStats, MedianPriceStats, Retailer } from '@/types/pricing';

export function useBrands() {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { brands, loading, error };
}

export function useRetailers() {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getRetailers()
      .then(data => setRetailers(data as Retailer[]))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { retailers, loading, error };
}

export function usePrices(filters: PriceFilters) {
  const [data, setData] = useState<PaginatedResponse<Price> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getPrices(filters)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}

export function useBrandStats(brand: string) {
  const [data, setData] = useState<BrandPriceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!brand) return;
    
    setLoading(true);
    getBrandStats(brand)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [brand]);

  return { data, loading, error };
}

export function useMedianStats(brand: string, days: number = 7) {
  const [data, setData] = useState<MedianPriceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!brand) return;
    
    setLoading(true);
    // Mock implementation for now
    const mockData: MedianPriceStats = {
      brand,
      period_days: days,
      retailer_medians: []
    };
    setData(mockData);
    setLoading(false);
  }, [brand, days]);

  return { data, loading, error };
}