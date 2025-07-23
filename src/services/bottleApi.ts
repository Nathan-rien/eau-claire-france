import { BottleWaterData } from '@/data/bottleComparisonData';

// Simulated API service for bottle data
class BottleApiService {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Lazy load the bottle data only when needed
  private async loadBottleData(): Promise<BottleWaterData[]> {
    const { bottleWaterDatabase } = await import('@/data/bottleComparisonData');
    return bottleWaterDatabase;
  }

  private getCacheKey(page: number, limit: number, search?: string, filters?: any): string {
    return `bottles_${page}_${limit}_${search || ''}_${JSON.stringify(filters || {})}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  async getBottles(options: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
      type_eau?: string;
      marque?: string;
      priceRange?: [number, number];
      qualityRange?: [number, number];
    };
  } = {}): Promise<{
    data: BottleWaterData[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    const { page = 1, limit = 50, search, filters } = options;
    const cacheKey = this.getCacheKey(page, limit, search, filters);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    // Load data lazily
    const allBottles = await this.loadBottleData();
    let filteredBottles = [...allBottles];

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredBottles = filteredBottles.filter(bottle => 
        bottle.marque.toLowerCase().includes(searchLower) ||
        bottle.nom_bouteille.toLowerCase().includes(searchLower) ||
        bottle.source.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters) {
      if (filters.type_eau) {
        filteredBottles = filteredBottles.filter(bottle => 
          bottle.type_eau === filters.type_eau
        );
      }
      
      if (filters.marque) {
        filteredBottles = filteredBottles.filter(bottle => 
          bottle.marque === filters.marque
        );
      }
      
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        filteredBottles = filteredBottles.filter(bottle => 
          bottle.prix_moyen_litre >= minPrice && bottle.prix_moyen_litre <= maxPrice
        );
      }
    }

    // Calculate pagination
    const total = filteredBottles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBottles = filteredBottles.slice(startIndex, endIndex);

    const result = {
      data: paginatedBottles,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    };

    // Cache the result
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  async getBottleById(id: number): Promise<BottleWaterData | null> {
    const cacheKey = `bottle_${id}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const allBottles = await this.loadBottleData();
    const bottle = allBottles.find(b => b.id === id) || null;

    // Cache the result
    this.cache.set(cacheKey, {
      data: bottle,
      timestamp: Date.now()
    });

    return bottle;
  }

  async getBottlesByIds(ids: number[]): Promise<BottleWaterData[]> {
    const cacheKey = `bottles_${ids.sort().join(',')}`; 
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const allBottles = await this.loadBottleData();
    const bottles = allBottles.filter(bottle => ids.includes(bottle.id));

    // Cache the result
    this.cache.set(cacheKey, {
      data: bottles,
      timestamp: Date.now()
    });

    return bottles;
  }

  async getBrands(): Promise<string[]> {
    const cacheKey = 'brands';
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const allBottles = await this.loadBottleData();
    const brands = [...new Set(allBottles.map(bottle => bottle.marque))].sort();

    // Cache the result
    this.cache.set(cacheKey, {
      data: brands,
      timestamp: Date.now()
    });

    return brands;
  }

  async getWaterTypes(): Promise<string[]> {
    const cacheKey = 'water_types';
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const allBottles = await this.loadBottleData();
    const types = [...new Set(allBottles.map(bottle => bottle.type_eau))].sort();

    // Cache the result
    this.cache.set(cacheKey, {
      data: types,
      timestamp: Date.now()
    });

    return types;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const bottleApi = new BottleApiService();