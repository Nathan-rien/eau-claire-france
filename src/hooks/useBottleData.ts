import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from "react";
import { bottleApi } from '@/services/bottleApi';
import { BottleWaterData } from '@/data/bottleComparisonData';
import { loadComposition, loadCatalog, loadMdd } from "@/services/waterData";

export const useBottles = (options: {
  page?: number;
  limit?: number;
  search?: string;
  filters?: any;
} = {}) => {
  return useQuery({
    queryKey: ['bottles', options],
    queryFn: () => bottleApi.getBottles(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useInfiniteBottles = (options: {
  limit?: number;
  search?: string;
  filters?: any;
} = {}) => {
  return useInfiniteQuery({
    queryKey: ['bottles-infinite', options],
    queryFn: ({ pageParam = 1 }) => 
      bottleApi.getBottles({ ...options, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useBottleById = (id: number) => {
  return useQuery({
    queryKey: ['bottle', id],
    queryFn: () => bottleApi.getBottleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useBottlesByIds = (ids: number[]) => {
  return useQuery({
    queryKey: ['bottles-by-ids', ids],
    queryFn: () => bottleApi.getBottlesByIds(ids),
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => bottleApi.getBrands(),
    staleTime: 10 * 60 * 1000, // 10 minutes - brands don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useWaterTypes = () => {
  return useQuery({
    queryKey: ['water-types'],
    queryFn: () => bottleApi.getWaterTypes(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export function useBottleData() {
  const [composition, setComposition] = useState<any[] | null>(null);
  const [catalog, setCatalog] = useState<any[] | null>(null);
  const [mdd, setMdd] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c1, c2, c3] = await Promise.all([
          loadComposition(),
          loadCatalog(),
          loadMdd(),
        ]);
        if (!alive) return;
        setComposition(c1);
        setCatalog(c2);
        setMdd(c3);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { composition, catalog, mdd, loading, error };
}