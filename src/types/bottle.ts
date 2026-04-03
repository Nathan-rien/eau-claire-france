/**
 * Centralized type definitions for bottle water data
 * Ensures type safety across the application
 */

import type { BottleWaterData } from '@/types/bottleTypes';
import { WaterData } from '@/data/bottleWaterData';

// Strict typing for mineral composition
export interface MineralComposition {
  readonly nitrates: number;
  readonly sodium: number;
  readonly calcium: number;
  readonly magnesium: number;
  readonly residusSec: number;
}

// Eco-score type with strict union
export type EcoScore = 'A' | 'B' | 'C' | 'D' | 'E';

// Water types with exhaustive options
export type WaterType = 
  | 'Eau de source'
  | 'Eau minérale naturelle'
  | 'Eau minérale naturelle gazeuse'
  | 'Eau du robinet';

// Packaging options
export type PackagingType = 
  | 'Plastique'
  | 'Verre'
  | 'Plastique / Verre'
  | 'Verre / Plastique'
  | 'Non spécifié';

// Enhanced bottle water data with strict typing
export interface StrictBottleWaterData extends Omit<BottleWaterData, 'ecoscore' | 'type_eau' | 'emballage'> {
  readonly ecoscore: EcoScore;
  readonly type_eau: WaterType;
  readonly emballage: PackagingType;
}

// Enhanced water data with strict typing
export interface StrictWaterData extends Omit<WaterData, 'composition' | 'type' | 'packaging'> {
  readonly composition: MineralComposition;
  readonly type: WaterType;
  readonly packaging: PackagingType;
}

// Comparison table props with strict typing
export interface BottleComparisonProps {
  selectedBottles: BottleWaterData[];
  showTapWater: boolean;
  onToggleFavorite?: (bottle: BottleWaterData) => void;
  onRemoveFavorite?: (bottleId: number) => void;
  isFavorite?: (bottleId: number) => boolean;
  showFavoriteControls?: boolean;
}

// Nutritional interpretation with strict return type
export interface NutritionalInterpretation {
  readonly label: string;
  readonly className: string;
  readonly severity: 'good' | 'warn' | 'bad';
}

// Loading state interface
export interface LoadingState {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error?: Error | null;
}

// API response wrapper for better error handling
export interface ApiResponse<T> {
  readonly data: T;
  readonly isSuccess: boolean;
  readonly error?: string;
  readonly timestamp: number;
}

// Search filters with strict typing
export interface BottleSearchFilters {
  readonly search?: string;
  readonly type?: WaterType;
  readonly ecoScore?: EcoScore;
  readonly priceRange?: readonly [number, number];
  readonly mineralRange?: Partial<Record<keyof MineralComposition, readonly [number, number]>>;
}

// Sort options
export type SortOption = 
  | 'name'
  | 'price'
  | 'ecoScore'
  | 'calcium'
  | 'magnesium'
  | 'sodium'
  | 'nitrates';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  readonly option: SortOption;
  readonly direction: SortDirection;
}

// Mobile breakpoint utilities
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;